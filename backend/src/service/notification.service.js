const getWoundNotify = (changePercentage, isWorsening) => {
  if (
    changePercentage === null ||
    changePercentage === undefined ||
    !isWorsening
  ) {
    return null;
  }

  if (changePercentage >= 70) {
    return {
      notificationType: "Clinical Vist",
      message:
        "Please visit a clinic for further assessment as soon as possible",
      scheduledDays: null,
    };
  }

  if (changePercentage >= 50) {
    return {
      notificationType: "Follow Up After 2 days",
      message: "upload the next wound image after 2 days",
      scheduledDays: 2,
    };
  }

  return {
    notificationType: "Follow up after 5 days",
    message: "upload the next wound image after 5 days",
    scheduledDays: 5,
  };
};

export { getWoundNotify };
