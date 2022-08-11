import { toastr } from 'react-redux-toastr';
import { getMyAndCalcRequests } from 'redux/rootActions';
import { storeLink } from 'index';
import { LANG_DICTIONARY } from 'consts';
import { getSocket } from 'websocket';
import { SOCKET_TYPE } from '../types';

const { ERROR } = LANG_DICTIONARY;

export default {
    subscribe: (id) => {
        getSocket().on(SOCKET_TYPE, (data) => {
            if (data.error) {
                toastr.error('', ERROR);

                return null;
            }

            const { data } = this.props;

            storeLink.dispatch(getMyAndCalcRequests(data));

            return null;
        });
    },

    unsubscribe: () => getSocket().removeListener(SOCKET_TYPE),
};
