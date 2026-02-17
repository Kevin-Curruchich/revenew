import { RouterProvider } from "react-router";
import { appRoute } from "./router/app.router";

export const RevenewApp = () => {
  return (
    <>
      <RouterProvider router={appRoute} />
    </>
  );
};
