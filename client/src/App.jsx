import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Outlet,
} from "react-router-dom";

import Register from "./pages/Register"
import Login from "./pages/Login"
import Write from "./pages/Write"
import Home from "./pages/Home"
import Single from "./pages/Single"
import Profile from "./pages/Profile"
import AdminDashboard from "./pages/AdminDashboard"

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";


const Layout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />

    </>
  );
};



const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/post/:id",
        element: <Single />
      },
      {
        path: "/write",
        element: <Write />
      },
      {
        path: "/profile/:username",
        element: <Profile />
      },
      {
        path: "/admin",
        element: <AdminDashboard />
      },
    ]

  },

  {
    path: "/register",
    element: <Register />,
  },

  {
    path: "/login",
    element: <Login />,
  },
])



function App() {
  return <RouterProvider router={router} />;
}




export default App;
