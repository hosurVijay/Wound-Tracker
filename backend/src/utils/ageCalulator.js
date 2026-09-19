const getAge = function (dob) {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const diffInMonth = today.getMonth() - birthDate.getMonth();
  if (
    diffInMonth < 0 ||
    (diffInMonth == 0 && today.getDate() < birthDate.getDate())
  )
    age--;
  return age;
};

export { getAge };
