import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import EnvironmentCheck from "./components/EnvironmentCheck/EnvironmentCheck";
import DevTools from "./components/DevTools/DevTools";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Login from "./pages/Login/Login";
import Homepage from "./pages/Homepage/Homepage";
import Dashboard from "./pages/Dashboard/Dashboard";
import Information from "./pages/Information/Information";
import ProfileUpdate from "./pages/ProfileUpdate/ProfileUpdate";
import Confirm from "./pages/Confirm/Confirm";
import ReportHistory from "./pages/ReportHistory/ReportHistory";
import ContactUs from "./pages/ContactUs/ContactUs";
import FAQs from "./pages/FAQs/FAQs";
import FunFactPage from "./pages/FunFacts/FunFactPage";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <EnvironmentCheck>
      <div className="app-container">
        {/* Background video - only show on non-funfact pages */}
        <video autoPlay muted loop id="background-video">
          <source src="./assets/VideoFiles/GreyBackgroundAE_Loop_002.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
        <div className="background-overlay"></div>
        
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/information" element={<Information />} />
            <Route path="/funfacts" element={<FunFactPage />} />
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
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <DevTools />
      </div>
    </EnvironmentCheck>
  );
};

export default App;