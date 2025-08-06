import { defineStore } from "pinia";
import { channelApi } from "@/axios/api-services/channelApi";
import { ref } from "vue";
import { toast } from 'vue3-toastify';
import { send } from "@/socket/socketService";
import { Status } from "@/config/enum";

export const useChannelStore = defineStore('channel', () => {
    const channelCurrent = ref({});
    const channels = ref([]);

    const fetchChannelById = async (channelId) => {
        try{
            const response = await channelApi.getChannelById(channelId);
            channelCurrent.value = response.data;
            return response.data;
        }catch (e){
            console.error(e);
        }
    }

    const fetchChannel = async () => {
        try{
            const response = await channelApi.getChannel();
            channels.value = response.data;
            return response.data
        } catch (e) {
            console.error(e);
        }
    }

    const createChannel = async (channelData) => {
        try {
            const res = await channelApi.createChannel(channelData);
            if(res.data == ""){
                return null;
            }
            else{
                await fetchChannel();
            }
            return res.data;
        } catch (e) {
            console.error("Failed to create channel:", e);
            toast.error("Có lỗi xảy ra khi tạo channel.");
        }
    };

    const leaveChannel = async () => {
        try {
            const res = await channelApi.leaveChannel(channelCurrent.value.id);
            await sendMessage({
                content: `{${Status.LEAVE_CHANNEL}}`,
                channelId: channelCurrent.value.id,
                type: Status.LEAVE_CHANNEL
            });
            await fetchChannel();
            return res.data;
        } catch (e) {
            console.error(e);
        }
    }

    const joinChannel = async (channelId) => {
        try {
            const res = await channelApi.joinChannel(channelId);
            channels.value.push(res.data);
            channelCurrent.value = res.data;
            sendMessage({
                content: `{${Status.JOIN_CHANNEL}}`,
                channelId: channelId,
                type: Status.JOIN_CHANNEL
            })
            return res.data;
        } catch (e) {
            console.error(e);
        }
    }

    const searchChannel = async (params) => {
        try {
            const res = await channelApi.searchChannel(params);
            return res.data;
        } catch (e) {
            console.error(e);
        }
    }

    function getUserName(email) {
        const found = channelCurrent.value?.members?.find(m => m.email === email);
        return found ? found.name : email;
    }

    // Gửi tin nhắn (có thể tái sử dụng ở nhiều component)
    const sendMessage = async ({ content, files = [], channelId, uploadFiles, type = Status.MESSAGE }) => {
        if (content.trim() || files.length > 0) {
            try {
                let uploadedFiles = [];
                if (files.length > 0) {
                    uploadedFiles = await uploadFiles(files);
                }
                const messageData = {
                    content,
                    type,
                    files: uploadedFiles
                };
                send(`/app/chat/send/${channelId}`, messageData);
                return true;
            } catch (error) {
                console.error('Error sending message:', error);
                throw error;
            }
        }
        return false;
    }

    return {
        channelCurrent,
        channels,
        fetchChannelById,
        fetchChannel,
        createChannel,
        leaveChannel,
        searchChannel,
        joinChannel,
        getUserName,
        sendMessage
    };
})