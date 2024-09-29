import "./main.scss";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    errorMsg?: string,
    successMsg?: string
}

const Input: React.FC<InputProps> = ({ title, id, type, placeholder, value, className, onChange, errorMsg, successMsg,  ...props }) => {
    return (
        <div className="custom-input">
            <div className="input">
                <input
                    type={type}
                    id={id}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`${errorMsg ? "error" : ""} ${successMsg ? "success" : ""} ${className}`}
                    {...props}
                />
                <label htmlFor={id}>{title}</label>
            </div>
            <div className="message">
            <span className="error-message">{errorMsg}</span>
            <span className="success-message">{successMsg}</span>
            </div>
        </div>
    );
};

export default Input;
