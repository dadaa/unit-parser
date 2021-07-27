import { UnitParser } from "./unit-parser.js";
import { TimezoneParser } from "./timezone-parser.js";

export class QueryParser {
  constructor(langs) {
    this._templates = [];
    this._unitParser = new UnitParser(langs);
    this._timezoneParser = new TimezoneParser(langs);
  }

  addTemplate(lang, template) {
    const indexOfFrom = template.indexOf("${from}");
    const indexOfTo = template.indexOf("${to}");

    template = template.replace("${from}", "(.+)");
    template = template.replace("${to}", "(.+)");

    this._templates.push({
      regexp: new RegExp(template, "i"),
      fromIndex: indexOfFrom < indexOfTo ? 0 : 1,
      toIndex: indexOfFrom < indexOfTo ? 1 : 0,
      lang,
    });
  }

  parse(text) {
    for (const { regexp, fromIndex, toIndex, lang } of this._templates) {
      const result = regexp.exec(text);
      if (!result) {
        continue;
      }

      const fromString = result[fromIndex + 1].trim();
      const toString = result[toIndex + 1].trim();

      const fromUnit = this._unitParser.parse(fromString);
      const toUnit = this._unitParser.parse(toString);
      if (fromUnit && toUnit && fromUnit.group === toUnit.group) {
        return { type: "unit", from: fromUnit, to: toUnit, lang };
      }

      const fromTimezone = this._timezoneParser.parse(fromString);
      const toTimezone = this._timezoneParser.parse(toString);
      if (
        fromTimezone &&
        toTimezone &&
        fromTimezone.type !== "timezone" &&
        toTimezone.type === "timezone"
      ) {
        return { type: "timezone", from: fromTimezone, to: toTimezone, lang };
      }
    }

    return null;
  }
};
