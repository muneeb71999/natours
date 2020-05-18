import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import alertMessage from "./alerts";

export const bookTour = async (tourId) => {
  try {
    const stripe = await loadStripe(
      "pk_test_UQ6gMnZSbA7UyhsIkaIw2gVP0054UFUQbW"
    );

    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // console.log(session);

    const { error } = await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });

    if (error) {
      console.error(error);
    }
  } catch (error) {
    alertMessage("error", error.message);
  }
};
