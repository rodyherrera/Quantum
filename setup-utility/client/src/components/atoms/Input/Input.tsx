import './Input.css';

interface InputProps{
    value: string;
    type: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    helperText?: string;
}

const Input: React.FC<InputProps> = (props) => {
    return (
        <div className='Input-Container'>
            <div className='Input'>
                <input {...props}/>
            </div>

            {props.helperText && (
                <p className='Input-Helper-Text'>{props.helperText}</p>
            )}
        </div>
    );
};

export default Input;