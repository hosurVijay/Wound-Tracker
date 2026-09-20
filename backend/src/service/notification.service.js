const getWoundNotify = (changePercentage, isWorsening) => {
  if (
    changePercentage === null ||
    changePercentage === undefined ||
    !isWorsening
  ) {
    return null;
  }

  if (changePercentage > 50) {
    return {
      notificationType: "Follow Up After 5 days",
      message: "upload the next wound image after 5 days",
      scheduledDays: 2,
    };
  }

  if (changePercentage > 70) {
    return {
      notificationType: "Follow Up After 2 days",
      message: "upload the next wound image after 2 days",
      scheduledDays: 2,
    };
  }

  return {
    notificationType: "Clinical Visit",
    message: "Please visit a clinic for further assessment as soon as possible",
    scheduledDays: 2,
  };
};

export { getWoundNotify };
