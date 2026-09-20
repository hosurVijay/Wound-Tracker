const calculateWoundChange = (previousArea, currentArea) => {
  if (previousArea === null || previousArea === undefined) {
    return {
      changeArea: null,
      changePercentage: null,
      isWorsening: false,
    };
  }

  const changeArea = currentArea - previousArea;
  const changePercentage = (changeArea / previousArea) * 100;

  return {
    changeArea,
    changePercentage,
    isWorsening: changeArea > 0,
  };
};

export { calculateWoundChange };
