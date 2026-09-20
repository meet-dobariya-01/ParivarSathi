export const generateApplicationId = () => {
  const digits = Array.from({ length: 5 }, () =>
    String(Math.floor(Math.random() * 10))
  ).join("");

  return `APP-${digits}`;
};

export default generateApplicationId;
