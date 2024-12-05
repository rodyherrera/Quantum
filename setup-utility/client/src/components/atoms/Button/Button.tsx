import './Button.css';

interface ButtonProps {
    text: string;
}

const Button: React.FC<ButtonProps> = ({ text, ...props }) => {
    return (
        <button className='Button-Container' {...props}>
            <span className='Button-Message'>{text}</span>
        </button>
    );
};

export default Button;