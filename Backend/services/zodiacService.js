const ZODIAC_SIGNS = [
  { name: "aries", startMonth: 3, startDay: 21, endMonth: 4, endDay: 19, dateRange: "Mar 21 - Apr 19" },
  { name: "taurus", startMonth: 4, startDay: 20, endMonth: 5, endDay: 20, dateRange: "Apr 20 - May 20" },
  { name: "gemini", startMonth: 5, startDay: 21, endMonth: 6, endDay: 20, dateRange: "May 21 - Jun 20" },
  { name: "cancer", startMonth: 6, startDay: 21, endMonth: 7, endDay: 22, dateRange: "Jun 21 - Jul 22" },
  { name: "leo", startMonth: 7, startDay: 23, endMonth: 8, endDay: 22, dateRange: "Jul 23 - Aug 22" },
  { name: "virgo", startMonth: 8, startDay: 23, endMonth: 9, endDay: 22, dateRange: "Aug 23 - Sep 22" },
  { name: "libra", startMonth: 9, startDay: 23, endMonth: 10, endDay: 22, dateRange: "Sep 23 - Oct 22" },
  { name: "scorpio", startMonth: 10, startDay: 23, endMonth: 11, endDay: 21, dateRange: "Oct 23 - Nov 21" },
  { name: "sagittarius", startMonth: 11, startDay: 22, endMonth: 12, endDay: 21, dateRange: "Nov 22 - Dec 21" },
  { name: "capricorn", startMonth: 12, startDay: 22, endMonth: 1, endDay: 19, dateRange: "Dec 22 - Jan 19" },
  { name: "aquarius", startMonth: 1, startDay: 20, endMonth: 2, endDay: 18, dateRange: "Jan 20 - Feb 18" },
  { name: "pisces", startMonth: 2, startDay: 19, endMonth: 3, endDay: 20, dateRange: "Feb 19 - Mar 20" },
];

const getZodiacFromDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) {
    throw new Error("A valid date of birth is required.");
  }

  let month;
  let day;

  if (typeof dateOfBirth === "string") {
    const parts = dateOfBirth.split("-");

    if (parts.length < 3) {
      throw new Error("A valid date of birth is required.");
    }

    month = Number(parts[1]);
    day = Number(parts[2]);
  } else {
    const date = new Date(dateOfBirth);

    if (Number.isNaN(date.getTime())) {
      throw new Error("A valid date of birth is required.");
    }

    month = date.getUTCMonth() + 1;
    day = date.getUTCDate();
  }

  const sign = ZODIAC_SIGNS.find(({ startMonth, startDay, endMonth, endDay }) => {
    const startsThisMonth = month === startMonth && day >= startDay;
    const endsThisMonth = month === endMonth && day <= endDay;

    return startMonth > endMonth
      ? startsThisMonth || endsThisMonth
      : startsThisMonth || endsThisMonth;
  });

  if (!sign) {
    throw new Error("Unable to determine zodiac sign.");
  }

  return sign.name;
};

const getZodiacDateRange = (zodiac) => {
  const sign = ZODIAC_SIGNS.find(({ name }) => name === zodiac.toLowerCase());
  return sign ? sign.dateRange : "";
};

module.exports = {
  getZodiacFromDateOfBirth,
  getZodiacDateRange,
};
