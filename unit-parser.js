// https://github.com/unicode-org/cldr/blob/master/common/validity/unit.xml
const CLDR_REGULAR_UNITS = [
	"acceleration-g-force",
  "acceleration-meter-per-square-second",
	"angle-arc-minute",
  "angle-arc-second",
  "angle-degree",
  "angle-radian",
  "angle-revolution",
	"area-acre",
	"area-hectare",
  "area-square-centimeter",
  "area-square-foot",
  "area-square-inch",
  "area-square-kilometer",
	"area-square-meter",
  "area-square-mile",
  "area-square-yard",
	"area-dunam",
	"concentr-karat",
	"concentr-milligram-ofglucose-per-deciliter",
  "concentr-millimole-per-liter",
	"concentr-percent",
  "concentr-permille",
  "concentr-permyriad",
  "concentr-permillion",
	"concentr-mole",
  "concentr-item",
  "concentr-portion",
	"concentr-ofglucose",
	"consumption-liter-per-100-kilometer",
  "consumption-liter-per-kilometer",
	"consumption-mile-per-gallon",
  "consumption-mile-per-gallon-imperial",
	"digital-bit",
  "digital-byte",
	"digital-gigabit",
  "digital-gigabyte",
  "digital-kilobit",
  "digital-kilobyte",
  "digital-megabit",
	"digital-megabyte",
  "digital-petabyte",
  "digital-terabit",
  "digital-terabyte",
	"duration-century",
  "duration-decade",
  "duration-day",
	"duration-day-person",
  "duration-hour",
  "duration-microsecond",
  "duration-millisecond",
	"duration-minute",
	"duration-month",
  "duration-month-person",
  "duration-nanosecond",
  "duration-second",
	"duration-week",
	"duration-week-person",
  "duration-year",
  "duration-year-person",
	"electric-ampere",
  "electric-milliampere",
	"electric-ohm",
  "electric-volt",
	"energy-calorie",
  "energy-foodcalorie",
  "energy-joule",
  "energy-kilocalorie",
	"energy-kilojoule",
  "energy-kilowatt-hour",
	"energy-electronvolt",
	"energy-therm-us",
	"energy-british-thermal-unit",
	"force-pound-force",
	"force-newton",
	"force-kilowatt-hour-per-100-kilometer",
	"frequency-gigahertz",
  "frequency-hertz",
  "frequency-kilohertz",
	"frequency-megahertz",
	"graphics-dot",
  "graphics-dot-per-centimeter",
  "graphics-dot-per-inch",
	"graphics-em",
  "graphics-megapixel",
  "graphics-pixel",
	"graphics-pixel-per-centimeter",
  "graphics-pixel-per-inch",
	"length-100-kilometer",
  "length-astronomical-unit",
  "length-centimeter",
  "length-decimeter",
  "length-fathom",
	"length-foot",
	"length-furlong",
  "length-inch",
  "length-kilometer",
  "length-light-year",
  "length-meter",
	"length-micrometer",
	"length-mile",
  "length-mile-scandinavian",
  "length-millimeter",
	"length-nanometer",
	"length-nautical-mile",
  "length-parsec",
  "length-picometer",
  "length-point",
  "length-yard",
	"length-earth-radius",
  "length-solar-radius",
	"light-candela",
  "light-lumen",
	"light-lux",
	"light-solar-luminosity",
	"mass-carat",
  "mass-grain",
  "mass-gram",
  "mass-kilogram",
  "mass-metric-ton",
  "mass-microgram",
  "mass-milligram",
  "mass-ounce",
	"mass-ounce-troy",
  "mass-pound",
  "mass-stone",
  "mass-ton",
	"mass-dalton",
	"mass-earth-mass",
	"mass-solar-mass",
	"power-gigawatt",
  "power-horsepower",
  "power-kilowatt",
	"power-megawatt",
  "power-milliwatt",
  "power-watt",
	"pressure-atmosphere",
  "pressure-hectopascal",
  "pressure-inch-ofhg",
  "pressure-bar",
  "pressure-millibar",
	"pressure-millimeter-ofhg",
	"pressure-pound-force-per-square-inch",
	"pressure-pascal",
	"pressure-kilopascal",
	"pressure-megapascal",
	"pressure-ofhg",
	"speed-kilometer-per-hour",
  "speed-knot",
  "speed-meter-per-second",
  "speed-mile-per-hour",
	"temperature-celsius",
  "temperature-fahrenheit",
  "temperature-generic",
  "temperature-kelvin",
	"torque-pound-force-foot",
	"torque-newton-meter",
	"volume-acre-foot",
  "volume-bushel",
  "volume-centiliter",
  "volume-cubic-centimeter",
  "volume-cubic-foot",
	"volume-cubic-inch",
	"volume-cubic-kilometer",
  "volume-cubic-meter",
  "volume-cubic-mile",
  "volume-cubic-yard",
	"volume-cup",
  "volume-cup-metric",
	"volume-deciliter",
	"volume-dessert-spoon",
  "volume-dessert-spoon-imperial",
  "volume-drop",
  "volume-dram",
  "volume-jigger",
  "volume-pinch",
  "volume-quart-imperial",
	"volume-fluid-ounce",
  "volume-fluid-ounce-imperial",
	"volume-gallon",
  "volume-gallon-imperial",
  "volume-hectoliter",
	"volume-liter",
  "volume-megaliter",
  "volume-milliliter",
  "volume-pint",
  "volume-pint-metric",
  "volume-quart",
	"volume-tablespoon",
  "volume-teaspoon",
	"volume-barrel",
];

const LANGS = ["en", "ja"];

export class UnitParser {
  constructor() {
    this._init();
  }

  _init() {
    const rules = [];

    for (const unitWithGroup of CLDR_REGULAR_UNITS) {
      // As the unit name in unit.xml contains group and unit, separete them first.
      const matches = unitWithGroup.match(/([a-z]+)-(.+)/);
      const group = matches[1];
      const unit = matches[2];

      for (const lang of LANGS) {
        try {
          // Get formatted parts from Intl.Numberformat for given unit and lang.
          // If Intl.Numberformat can't recognize the unit or lang, throw an error.
          const parts = Intl.NumberFormat(lang, {
            style: "unit",
            unit,
            unitDisplay: "long",
          }).formatToParts(1);

          // Create regex from the parts.
          const regexpString = "^" + parts.map(({ type, value }) => {
            switch (type) {
              case "unit": {
                return value;
              }
              case "integer": {
                return "(\\S*)";
              }
            }
            return null;
          }).filter(Boolean).join("\\s*");

          const regexp = new RegExp(regexpString, "i");
          const rule = { regexp, unit, group, lang };
          rules.push(rule);
        } catch (e) {
          console.warn(e.message);
        }
      }
    }

    this._rules = rules;
  }

  parse(text) {
    for (const { regexp, unit, group, lang } of this._rules) {
      // Find a rule that matches the text.
      const result = regexp.exec(text);

      if (result) {
        // Get value part.
        const value = result[1];

        // Make NumberFormat recognize the value again,
        // check whether or not the value can be numeric.
        const parts = Intl.NumberFormat(lang, {
          style: "unit",
          unit,
          unitDisplay: "long",
        }).formatToParts(value);

        const hasNaN = parts.some(part => part.type === "nan");

        if (!hasNaN) {
          // If not having nan, the text could be parsed.
          return { unit, value, group, lang };
        }
      }
    }

    return null;
  }
};
