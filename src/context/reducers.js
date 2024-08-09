import {
  LOGIN_START,
  LOGIN_SUCCESS,
  LOGIN_FAILED,
  LOGOUT_USER,
  SIGNUP_START,
  SIGNUP_SUCCESS,
  SIGNUP_FAILED,
  NEW_ANNOUNCEMENT_ADDED,
  UPDATE_USER_START,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAILED,
  ADD_CONVERSATION_NAME,
  SELECTED_SEARCHED_MESSAGE,
  ADD_CONVERSATION_NAMES,
  SHOW_LOGOUT_FROM_OTHER_DEVICES ,
  CLOSE_LOGOUT_FROM_OTHER_DEVICES
} from "./actions";

import { initialState } from "./appContext";

const reducer = (state, action) => {
  if (action.type === LOGIN_START) {
    return {
      ...state,
      loading: true,
    };
  }
  if (action.type === LOGIN_SUCCESS) {
    return {
      ...state,
      loading: false,
      user: action.payload.user,
      token: action.payload.token,
      isAdmin: action.payload.isAdmin,
      isAnnouncing: action.payload.isAnnouncing,
    };
  }
  if (action.type === LOGIN_FAILED) {
    return {
      ...state,
      loading: false,
      error: action.payload.msg,
    };
  }

  if (action.type === SELECTED_SEARCHED_MESSAGE) {
    return {
      ...state,
      selectedSearchedMessage: {
        conversationId: action.payload.conversationId,
        messageId: action.payload.messageId,
        isGroup: action.payload.isGroup,
        isMessage: action.payload.isMessage,
        members: action.payload.members,
      },
    };
  }
  if (action.type === SIGNUP_START) {
    return {
      ...state,
      loading: true,
    };
  }
  if (action.type === SIGNUP_SUCCESS) {
    return {
      ...state,
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === SIGNUP_FAILED) {
    return {
      ...state,
      loading: false,
      error: action.payload.msg,
    };
  }
  if (action.type === LOGOUT_USER) {
    return {
      ...initialState,
    };
  }
  if (action.type === NEW_ANNOUNCEMENT_ADDED) {
    return {
      ...state,
      newAnnouncement: true,
    };
  }
  if (action.type === UPDATE_USER_START) {
    return {
      ...state,
      loading: true,
    };
  }
  if (action.type === UPDATE_USER_SUCCESS) {
    return {
      ...state,
      user: action.payload,
      loading: false,
      error: null,
    };
  }
  if (action.type === UPDATE_USER_FAILED) {
    return {
      ...state,
      loading: false,
      error: action.payload.msg,
    };
  }
  if(action.type === SHOW_LOGOUT_FROM_OTHER_DEVICES){
    return{
      ...state ,
      showLogoutFromOtherDevicesModal : true
    }
  }
  if(action.type === CLOSE_LOGOUT_FROM_OTHER_DEVICES){
    return{
      ...state ,
      showLogoutFromOtherDevicesModal : false
    }
  }

  if (action.type === ADD_CONVERSATION_NAMES) {
    const newConversationNames = action.payload.reduce((prev, cur) => {
      const convObj = {
        [cur._id]: {
          name:
            cur.name !== undefined
              ? cur.name
              : state.conversationNames[cur._id]?.name,
          isUnread:
            cur.isUnread !== undefined
              ? cur.isUnread
              : state.conversationNames[cur._id]?.isUnread,
          isOnline:
            cur.isOnline !== undefined
              ? cur.isOnline
              : state.conversationNames[cur._id]?.isOnline,
        },
      };

      return { ...prev, ...convObj };
      
    }, {});

    // console.log(newConversationNames);

    return {
      ...state,
      conversationNames: {
        ...state.conversationNames,
        ...newConversationNames,
      },
    };
  }
  if (action.type === ADD_CONVERSATION_NAME) {

    return {
      ...state,
      conversationNames: {
        ...state.conversationNames,
        [action.payload._id]: {
          name:
            action.payload.name !== undefined
              ? action.payload.name
              : state.conversationNames[action.payload._id]?.name,
          isUnread:
            action.payload.isUnread !== undefined
              ? action.payload.isUnread
              : state.conversationNames[action.payload._id]?.isUnread,
          isOnline:
            action.payload.isOnline !== undefined
              ? action.payload.isOnline
              : state.conversationNames[action.payload._id]?.isOnline,
        },
      },
    };
  }

  throw new Error(`no such action :  ${action.type} `);
};

export default reducer;
