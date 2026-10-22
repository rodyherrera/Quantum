import { Fragment } from 'react';
import { order } from '@/modules/home/utils/order';

interface LandingWordsProps{
    text: string;
    from: number;
}

const LandingWords = ({ text, from }: LandingWordsProps) => text.split(' ').map((word, index) => (
    <Fragment key={index}>
        {index > 0 && ' '}
        <span className='lp-word' style={order(from + index)}>{word}</span>
    </Fragment>
));

export default LandingWords;
