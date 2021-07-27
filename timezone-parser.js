export class TimezoneParser {
  constructor(langs) {
    this._init(langs);
  }

  _init(langs) {
    const rules = [];

    for (const lang of langs) {
      // No meridiem time rules.
      rules.push(
        this._makeRule(lang, true, {
          isMeridiemNeeded: false,
          isMinuteNeeded: false,
          isTimezoneNeeded: false,
        })
      );
      rules.push(
        this._makeRule(lang, true, {
          isMeridiemNeeded: false,
          isMinuteNeeded: true,
          isTimezoneNeeded: false,
        })
      );
      rules.push(
        this._makeRule(lang, true, {
          isMeridiemNeeded: false,
          isMinuteNeeded: false,
          isTimezoneNeeded: true,
        })
      );
      rules.push(
        this._makeRule(lang, true, {
          isMeridiemNeeded: false,
          isMinuteNeeded: true,
          isTimezoneNeeded: true,
        })
      );

      // With meridiem time rules.
      for (const isAMTime of [true, false]) {
        rules.push(
          this._makeRule(lang, isAMTime, {
            isMeridiemNeeded: true,
            isMinuteNeeded: false,
            isTimezoneNeeded: false,
          })
        );
        rules.push(
          this._makeRule(lang, isAMTime, {
            isMeridiemNeeded: true,
            isMinuteNeeded: true,
            isTimezoneNeeded: false,
          })
        );
        rules.push(
          this._makeRule(lang, isAMTime, {
            isMeridiemNeeded: true,
            isMinuteNeeded: false,
            isTimezoneNeeded: true,
          })
        );
        rules.push(
          this._makeRule(lang, isAMTime, {
            isMeridiemNeeded: true,
            isMinuteNeeded: true,
            isTimezoneNeeded: true,
          })
        );
      }
    }

    rules.push({
      regexp: /^(\S+)$/i,
      type: "timezone",
      hourIndex: -1,
      minuteIndex: -1,
      timezoneIndex: 0,
      lang: "en",
    });

    this._rules = rules;
  }

  _makeRule(lang, isAMTime, options) {
    const { isMeridiemNeeded, isMinuteNeeded, isTimezoneNeeded } = options;

    const hours = isAMTime ? 2 : 14;
    const date = new Date(Date.UTC(0, 0, 0, hours, 0));

    const parts = Intl.DateTimeFormat(lang, {
      timeZone: "Europe/London",
      hour: "numeric",
      minute: isMinuteNeeded ? "numeric" : undefined,
      timeZoneName: isTimezoneNeeded ? "short" : undefined,
      hour12: isMeridiemNeeded,
    }).formatToParts(date);

    const regexpString = "^" + parts.map(({ type, value }) => {
      switch (type) {
        case "dayPeriod": {
          return value;
        }
        case "timeZoneName": {
          return "(\\S+)";
        }
        case "hour": {
          return "(\\d{1,2})";
        }
        case "minute": {
          return "(\\d{1,2})";
        }
        case "literal": {
          return value;
        }
      }
      return null;
    }).filter(Boolean).join("\\s*") + "$";
    const regexp = new RegExp(regexpString, "i");

    const partsInRegexp = parts.filter(
      p => p.type === "hour" || p.type === "minute" || p.type === "timeZoneName"
    );

    return {
      regexp,
      type: !isMeridiemNeeded ? "absolute" : isAMTime ? "am" : "pm",
      hourIndex: partsInRegexp.findIndex(p => p.type === "hour"),
      minuteIndex: partsInRegexp.findIndex(p => p.type === "minute"),
      timezoneIndex: partsInRegexp.findIndex(p => p.type === "timeZoneName"),
      lang,
    };
  }

  parse(text) {
    for (const { regexp, type, hourIndex, minuteIndex, timezoneIndex, lang } of this._rules) {
      // Find a rule that matches the text.
      const result = regexp.exec(text);

      if (!result) {
        continue
      }

      // Get value part.
      const timezone = timezoneIndex < 0 ? null : result[timezoneIndex + 1];
      const hour = result[hourIndex + 1];
      const minute = minuteIndex < 0 ? null : result[minuteIndex + 1];

      // Check whether or not if the timezone is valid.
      if (timezone) {
        try {
          Intl.DateTimeFormat("en", { timeZone: timezone });
        } catch (e) {
          console.warn(e.message);
          return null;
        }
      }

      return { type, hour, minute, timezone, lang };
    }

    return null;
  }
};
