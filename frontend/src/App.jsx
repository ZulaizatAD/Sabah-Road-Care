import { Routes, Route } from "react-router-dom";
import { Slide, ToastContainer } from "react-toastify";
import { UserProvider } from "./context/UserContext";
import EnvironmentCheck from "./components/EnvironmentCheck/EnvironmentCheck";
import DevTools from "./utils/DevTools/DevTools";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import AnimatedBG from "./components/VideoBG/AnimatedBG";
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Homepage from "./pages/Homepage/Homepage";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProfileUpdate from "./pages/ProfileUpdate/ProfileUpdate";
import Confirm from "./pages/Confirm/Confirm";
import ReportHistory from "./pages/ReportHistory/ReportHistory";
import ContactUs from "./pages/ContactUs/ContactUs";
import FAQs from "./pages/FAQs/FAQs";
import FunFactMainPage from "./pages/Information/FunFactPage/FunFactMainPage";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <UserProvider>
      <EnvironmentCheck>
        <div className="app-container">
          <AnimatedBG />
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/homepage" element={<Homepage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/information" element={<FunFactMainPage />} />
              <Route path="/history" element={<ReportHistory />} />
              <Route path="/profileupdate" element={<ProfileUpdate />} />
              <Route path="/confirm" element={<Confirm />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="*" element={<Homepage />} />
            </Routes>
          </main>
          <Footer />

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            toastClassName="custom-toast"
            bodyClassName="custom-toast-body"
            progressClassName="custom-progress"
            closeButton={true}
            transition={Slide}
          />
          <DevTools />
        </div>
      </EnvironmentCheck>
    </UserProvider>
  );
};

export default App;
