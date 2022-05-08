export default (form) => {
  const formData = new FormData(form);
  return fetch(form.action, {
    method: "POST",
    body: formData,
    redirect: "manual"
  });
};