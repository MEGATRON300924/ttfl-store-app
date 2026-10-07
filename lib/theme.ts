export const theme = {
  colors: {
    graphite950: "#12141A",
    graphite900: "#1A1D24",
    graphite800: "#262A34",
    graphite700: "#3A3F4C",
    graphite600: "#5B6472",
    graphite400: "#8A93A3",
    graphite300: "#B8BEC8",
    graphite200: "#D6DAE1",
    cloud100: "#F5F6F8",
    cloud50: "#FBFBFC",
    ember700: "#B94A1F",
    ember600: "#E8622C",
    ember500: "#F0794A",
    ember100: "#FDE7DB",
    green700: "#166B45",
    green600: "#1F9D63",
    green100: "#DEF3E7",
    gold600: "#B98A1F",
    gold100: "#F8EFD9",
    white: "#FFFFFF",
  },
  radius: { card: 10, button: 10, image: 10, tag: 4 },
  shadow: {
    card: {
      shadowColor: "#12141A",
      shadowOpacity: 0.04,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    hover: {
      shadowColor: "#12141A",
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
  },
};

export const money = (value: number | string, currency = "₦") =>
  `${currency}${Number(value || 0).toLocaleString("en-NG")}`;
