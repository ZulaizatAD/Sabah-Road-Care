import React, { useState, useRef } from 'react';
import "./ProfileUpdate.css"

const ProfileUpdater = () => {
    const [profileImage, setProfileImage] = useState(null);
    const [name, setName] = useState('Abu Bakar Ellah');
    const [email, setEmail] = useState('abubakarellah@gmail.com');
    const [password, setPassword] = useState(''); // Start with empty password
    const [showSuccess, setShowSuccess] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProfileImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };
    
    const handleUpdate = (e) => {
        e.preventDefault();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className="profile-updater-container">
            <div className="profile-updater-glass">
                <form onSubmit={handleUpdate} className="profile-form">
                    <div className="uploader-section">
                        <div 
                            className="image-uploader" 
                            onClick={handleUploadClick}
                            role="button"
                            aria-label="Upload profile picture"
                            tabIndex={0}
                        >
                            {profileImage ? (
                                <img 
                                    src={profileImage} 
                                    alt="Profile Preview" 
                                    className="profile-preview-image" 
                                    onError={(e) => {
                                        e.target.onerror = null; 
                                        e.target.parentElement.textContent = 'Upload';
                                    }}
                                />
                            ) : (
                                <span>Upload</span>
                            )}
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageChange} 
                            style={{ display: 'none' }} 
                            accept="image/*"
                            aria-label="Profile picture upload"
                        />
                    </div>
                    <div className="form-fields">
                        <div className="input-group">
                            <label htmlFor="name">Name</label>
                            <input 
                                id="name" 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                aria-required="true"
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input 
                                id="email" 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                aria-required="true"
                            />
                        </div>
                        <div className="input-group password-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-container">
                                <input 
                                    id="password" 
                                    type={passwordVisible ? "text" : "password"} 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder="Enter new password"
                                    aria-required="true"
                                />
                                <button 
                                    type="button" 
                                    className="toggle-password"
                                    onClick={togglePasswordVisibility}
                                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                                >
                                    {passwordVisible ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="update-button">UPDATE</button>
                </form>
            </div>
            {showSuccess && <SuccessMessage onClose={() => setShowSuccess(false)} />}
        </div>
    );
};

// SuccessMessage component implementation
const SuccessMessage = ({ onClose }) => (
    <div className="success-message">
        <div className="success-content">
            <span>✓</span>
            <p>Profile updated successfully!</p>
        </div>
        <button 
            onClick={onClose} 
            className="close-button"
            aria-label="Close notification"
        >
            &times;
        </button>
    </div>
);

export default ProfileUpdater;
