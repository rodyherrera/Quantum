import everybody from './everybody';
import guest from './guest';
import protectedPages from './protected';

const pages = {
    everybody,
    guest,
    protected: protectedPages
};

export default pages;