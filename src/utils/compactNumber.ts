// convert 1,000,000 to 1M and 1,000 to 1K and 1,000,000,000 to 1B and so on
// i.e 1,234,567,890 to 1.2B and 1,234,567 to 1.2M and 10,234 to 10.2K


export default (num: number):string => {
  const units = ["K", "M", "B", "T"];

  for (let i = units.length - 1; i >= 0; i--) {
    const decimal = Math.pow(1000, i + 1);

    if (num <= -decimal || num >= decimal) {
      return +(num / decimal).toFixed(1) + units[i];
    }
  }

  return Math.floor(num).toString();
}