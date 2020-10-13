import { Msg, msgList } from '../../msg';

export default {
    msgs: (): Msg[] => msgList,
    msg: (id: number): Msg | undefined => msgList.find((msg) => msg.id === id),
    addMsg: (text: string): Msg => {
        const msg: Msg = { id: msgList.length + 1, text: text };
        msgList.push(msg);
        return msg;
    }
};
