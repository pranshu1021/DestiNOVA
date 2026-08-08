import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { getSocket, initSocket } from "../../services/socket";
import CosmicBackground from "../../components/CosmicBackground";
import { useFocusEffect } from "@react-navigation/native";

export default function AstrologerSessionScreen({ navigation, route }) {
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [socketReady, setSocketReady] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingStatus, setTypingStatus] = useState("");
  const [callStatus, setCallStatus] = useState("ready");
  const [loading, setLoading] = useState(true);
  const typingTimeout = useRef(null);

  const {
    astrologerId,
    astrologerName,
    astrologerUserId,
    sessionType,
    costPerMinute: routeCostPerMinute,
    sessionId: routeSessionId,
    pendingRequest,
  } = route.params || {};

  const currentUserId = useMemo(() => user?.id || user?._id || "", [user]);
  const sessionId = useMemo(() => routeSessionId || `${currentUserId}_${astrologerId}_${Date.now()}`,
    [routeSessionId, currentUserId, astrologerId]);
  const costPerMinute = useMemo(() => Number(routeCostPerMinute) || 15, [routeCostPerMinute]);
  const paymentCategory = sessionType === "call" ? "CALL_DEDUCTION" : "CHAT_DEDUCTION";
  const [walletBalance, setWalletBalance] = useState(0);
  const [sessionPaid, setSessionPaid] = useState(false);
  const [deductionLoading, setDeductionLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(true);
  const [requestAccepted, setRequestAccepted] = useState(Boolean(pendingRequest) ? false : true);
  const [sessionStatus, setSessionStatus] = useState(pendingRequest ? "Waiting for astrologer to accept..." : "Connected");

  const handleReceiveMessage = useCallback((message) => {
    if (!message || message.sessionId !== sessionId) return;
    setMessages((prev) => {
      const exists = prev.some((m) => m._id && message._id && m._id === message._id);
      if (exists) return prev;
      return [...prev, message];
    });
  }, [sessionId]);

  const handleUserTyping = useCallback(({ userId, isTyping }) => {
    if (userId === currentUserId) return;
    setTypingStatus(isTyping ? `${astrologerName} is typing...` : "");
  }, [astrologerName, currentUserId]);

  const handleIncomingCall = useCallback(({ from, callType }) => {
    if (from !== astrologerUserId) return;
    setCallStatus("incoming");
    Alert.alert(
      "Incoming Call",
      `${astrologerName} is calling you for a ${callType} session.`,
      [
        { text: "Decline", style: "cancel", onPress: () => endCall() },
        { text: "Accept", onPress: () => acceptCall() },
      ]
    );
  }, [astrologerName, astrologerUserId]);

  const handleCallAccepted = useCallback(() => {
    setCallStatus("connected");
    Alert.alert("Call connected", "Your astrologer has accepted the call.");
  }, []);

  const handleCallEnded = useCallback(() => {
    setCallStatus("ended");
    Alert.alert("Call ended", "The call has ended.");
  }, []);

  const loadWalletBalance = useCallback(async () => {
    try {
      const response = await api.get("/wallet/balance");
      const data = response.data.data || {};
      setWalletBalance(data.balance ?? 0);
    } catch (error) {
      console.log("Wallet load error:", error);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const response = await api.get(`/chat/session/${sessionId}`);
      const history = response.data.data || [];
      setMessages(history);
    } catch (error) {
      console.log("Chat history error:", error);
    }
  }, [sessionId]);

  const registerSocketListeners = useCallback((socket) => {
    socket.on("receive_message", handleReceiveMessage);
    socket.on("user_typing", handleUserTyping);
    socket.on("incoming_call", handleIncomingCall);
    socket.on("call_accepted", handleCallAccepted);
    socket.on("call_ended", handleCallEnded);
    socket.on("chat_request_accepted", ({ sessionId: acceptedSessionId }) => {
      if (acceptedSessionId !== sessionId) return;
      setRequestAccepted(true);
      setSessionStatus("Astrologer accepted your chat request.");
      Alert.alert("Accepted", "Astrologer accepted your chat request.");
    });
    socket.on("chat_request_rejected", ({ message }) => {
      setSessionStatus(message || "Astrologer is unavailable right now.");
      setRequestAccepted(false);
      Alert.alert("Rejected", message || "Astrologer is unavailable right now.");
    });
    socket.on("chat_started", ({ sessionId: startedSessionId }) => {
      if (startedSessionId !== sessionId) return;
      setRequestAccepted(true);
      setSessionStatus("Chat started.");
    });
  }, [handleReceiveMessage, handleUserTyping, handleIncomingCall, handleCallAccepted, handleCallEnded, sessionId]);

  const leaveRoom = useCallback(() => {
    const socket = getSocket();
    if (socket) {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("user_typing", handleUserTyping);
      socket.off("incoming_call", handleIncomingCall);
      socket.off("call_accepted", handleCallAccepted);
      socket.off("call_ended", handleCallEnded);
      socket.off("chat_request_accepted");
      socket.off("chat_request_rejected");
      socket.off("chat_started");
      socket.emit("end_call", { to: astrologerUserId });
    }
  }, [handleReceiveMessage, handleUserTyping, handleIncomingCall, handleCallAccepted, handleCallEnded, astrologerUserId]);

  const joinRoom = useCallback(async () => {
    try {
      const socket = await initSocket();
      registerSocketListeners(socket);
      socket.emit("join_room", { sessionId, userId: currentUserId });
      setSocketReady(true);
      if (pendingRequest) {
        setSessionStatus("Waiting for astrologer to accept...");
      }
    } catch (error) {
      console.log("Socket init error:", error);
      Alert.alert("Connection failed", "Unable to connect to the live session.");
    } finally {
      setLoading(false);
    }
  }, [sessionId, currentUserId, pendingRequest, registerSocketListeners]);

  useEffect(() => {
    loadWalletBalance();
    loadHistory();
    joinRoom();
    return () => {
      leaveRoom();
    };
  }, [joinRoom, loadHistory, loadWalletBalance, leaveRoom]);

  const sendTypingEvent = useCallback((isTyping) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit("typing", { sessionId, userId: currentUserId, isTyping });
  }, [sessionId, currentUserId]);

  const handleInputChange = (value) => {
    setText(value);
    sendTypingEvent(true);
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    typingTimeout.current = setTimeout(() => sendTypingEvent(false), 600);
  };

  const ensureSessionCredit = useCallback(async () => {
    if (sessionPaid) return true;
    try {
      setDeductionLoading(true);
      const response = await api.post("/wallet/deduct", {
        minutes: 1,
        costPerMinute,
        category: paymentCategory,
      });
      const data = response.data.data || {};
      setWalletBalance(data.walletBalance ?? walletBalance);
      setSessionPaid(true);
      Alert.alert("Payment confirmed", `₹${Number(costPerMinute).toFixed(0)} deducted from your wallet to start the session.`);
      return true;
    } catch (error) {
      console.log("Credit deduction failed:", error);
      const message = error.response?.data?.message || "Unable to deduct wallet credits. Please recharge.";
      Alert.alert(
        "Payment failed",
        message,
        [
          { text: "Go to Wallet", onPress: () => navigation.navigate("Wallet") },
          { text: "Cancel", style: "cancel" },
        ]
      );
      return false;
    } finally {
      setDeductionLoading(false);
    }
  }, [costPerMinute, paymentCategory, navigation, sessionPaid, walletBalance]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    if (!requestAccepted && pendingRequest) {
      Alert.alert("Pending", "Please wait for the astrologer to accept the request.");
      return;
    }
    if (!sessionPaid) {
      const canProceed = await ensureSessionCredit();
      if (!canProceed) return;
    }

    const socket = getSocket();
    if (!socket) {
      Alert.alert("Not connected", "Please wait for the session to connect.");
      return;
    }

    const message = {
      sessionId,
      senderId: currentUserId,
      receiverId: astrologerUserId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    socket.emit("send_message", message);
    setMessages((prev) => [...prev, message]);
    setText("");
    sendTypingEvent(false);
  };

  const requestCall = async () => {
    if (!sessionPaid) {
      const canProceed = await ensureSessionCredit();
      if (!canProceed) return;
    }

    const socket = getSocket();
    if (!socket) {
      Alert.alert("Not connected", "Please wait for the session to connect.");
      return;
    }
    setCallStatus("calling");
    socket.emit("call_offer", { to: astrologerUserId, from: currentUserId, callType: sessionType });
  };

  const acceptCall = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit("call_answer", { to: astrologerUserId, answer: "accepted" });
    setCallStatus("connected");
  };

  const endCall = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit("end_call", { to: astrologerUserId });
    }
    setCallStatus("ended");
  };

  const renderMessage = ({ item }) => {
    const isMine = item.senderId === currentUserId;
    return (
      <View style={[styles.messageRow, isMine ? styles.messageRight : styles.messageLeft]}>
        <View style={[styles.messageBubble, { backgroundColor: isMine ? colors.primary : colors.card, borderColor: colors.border }]}> 
          <Text style={[styles.messageText, { color: isMine ? colors.white : colors.textMain }]}>{item.text}</Text>
          <Text style={[styles.messageTime, { color: isMine ? "rgba(255,255,255,0.75)" : colors.textSub }]}>{new Date(item.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
        </View>
      </View>
    );
  };

  if (loading || walletLoading) {
    return (
      <CosmicBackground>
        <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.textSub, marginTop: spacing.sm }]}>Starting session...</Text>
          </View>
        </SafeAreaView>
      </CosmicBackground>
    );
  }

  return (
    <CosmicBackground>
      <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}> 
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primaryLight, borderRadius: borderRadius.md }]}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerTextWrapper}>
            <Text style={[styles.title, { color: colors.textMain, fontSize: typography.sizes.h2, fontWeight: typography.weights.bold }]}>{astrologerName}</Text>
            <Text style={[styles.subtitle, { color: colors.textSub, fontSize: typography.sizes.body }]}>{sessionType === "chat" ? "Live astrologer chat" : "Call session"}</Text>
          </View>
        </View>

        <View style={[styles.statusBanner, { backgroundColor: colors.card, borderColor: colors.border, ...shadows.soft }]}> 
          <Text style={[styles.statusText, { color: colors.textMain }]}>Session ID: {sessionId.slice(-8)}</Text>
          <Text style={[styles.statusText, { color: colors.textSub }]}>Wallet balance: ₹{walletBalance.toFixed(0)}</Text>
          <Text style={[styles.statusText, { color: colors.textSub }]}>Cost: ₹{costPerMinute.toFixed(0)} / min</Text>
          {typingStatus ? <Text style={[styles.statusText, { color: colors.primary }]}>{typingStatus}</Text> : null}
          <Text style={[styles.statusText, { color: colors.textSub }]}>Status: {pendingRequest && !requestAccepted ? sessionStatus : callStatus === "ready" ? "Connected" : callStatus === "calling" ? "Calling..." : callStatus === "connected" ? "Call active" : callStatus === "incoming" ? "Incoming call" : "Ended"}</Text>
          {deductionLoading ? <Text style={[styles.statusText, { color: colors.primary }]}>Authorizing session payment...</Text> : null}
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item, index) => item._id || `${item.senderId}-${index}`}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />

        {sessionType === "call" && (
          <View style={styles.callControls}>
            {callStatus !== "connected" && callStatus !== "ended" ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.callButton, { backgroundColor: colors.primary, borderRadius: borderRadius.lg }]}
                onPress={requestCall}
              >
                <Text style={[styles.callButtonText, { color: colors.white }]}>Request Call</Text>
              </TouchableOpacity>
            ) : null}
            {callStatus === "connected" && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.endCallButton, { backgroundColor: colors.danger, borderRadius: borderRadius.lg }]}
                onPress={endCall}
              >
                <Text style={[styles.callButtonText, { color: colors.white }]}>End Call</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {sessionType === "chat" && (
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inputContainer}> 
            <TextInput
              value={text}
              onChangeText={handleInputChange}
              placeholder="Type your message..."
              placeholderTextColor={colors.textSub}
              style={[styles.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textMain }]}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.sendButton, { backgroundColor: colors.primary, borderRadius: borderRadius.lg }]}
              onPress={sendMessage}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  backButton: { width: 44, height: 44, justifyContent: "center", alignItems: "center", marginRight: 12, borderWidth: 1 },
  headerTextWrapper: { flex: 1 },
  title: { marginBottom: 4 },
  subtitle: {},
  statusBanner: { padding: 16, margin: 20, borderWidth: 1, borderRadius: 16 },
  statusText: { fontSize: 13, marginBottom: 4 },
  messageList: { paddingHorizontal: 20, paddingBottom: 20 },
  messageRow: { marginBottom: 10 },
  messageLeft: { alignSelf: "flex-start" },
  messageRight: { alignSelf: "flex-end" },
  messageBubble: { maxWidth: "82%", padding: 14, borderWidth: 1, borderRadius: 18 },
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTime: { marginTop: 8, fontSize: 11 },
  inputContainer: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1 },
  textInput: { flex: 1, minHeight: 44, paddingHorizontal: 16, borderWidth: 1, marginRight: 12, borderRadius: 14 },
  sendButton: { width: 48, height: 48, justifyContent: "center", alignItems: "center" },
  callControls: { paddingHorizontal: 20, paddingBottom: 20 },
  callButton: { paddingVertical: 16, alignItems: "center" },
  endCallButton: { paddingVertical: 16, alignItems: "center" },
  callButtonText: { fontSize: 16, fontWeight: "700" },
});