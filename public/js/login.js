import axios from "axios";
import alertMessage from "./alerts";

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: "post",
      url: "/api/v1/users/login",
      data: {
        email,
        password,
      },
    });

    if (res.data.status === "success") {
      alertMessage("success", "Your are now logged in");
      setTimeout(() => {
        location.reload(true);
      }, 1000);
    }
  } catch (err) {
    alertMessage("error", "Incorect email or password");
  }
};

export const logout = async () => {
  try {
    const res = await axios.get("/api/v1/users/logout");

    if (res.data.status == "success") window.location.reload(true);
  } catch (err) {
    alertMessage("error", "Error Loggingout please try again");
    console.log(err);
  }
};
