import './Input.css';

interface InputProps {
    helperText?: string;
}

const Input: React.FC<InputProps> = ({ helperText, ...props }) => {
    return (
        <div className='Input-Container'>
            <div className='Input'>
                <input {...props} />
            </div>

            {helperText && (
                <p className='Input-Helper-Text'>{helperText}</p>
            )}
        </div>
    );
};

export default Input;