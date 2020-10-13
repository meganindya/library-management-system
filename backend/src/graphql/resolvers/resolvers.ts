import { Msg, msgList } from '../../msg';

export default {
    msgs: () => msgList,
    msg: (id: number) => msgList.find((msg) => msg.id === id),
    addMsg: (text: string) => {
        const msg: Msg = { id: msgList.length + 1, text: text };
        msgList.push(msg);
        return msg;
    }
};
