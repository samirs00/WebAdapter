export class DefaultMessage {
    EXIT:string ="Seems you were stuck we have cleared your data, You can say 'Hi' and start over";
    NOT_SURE:string ="Umm...Not sure about that, Please try something else";
    NONE_INTENT_MESSAGE:string ="Umm...Not sure about that, Please try something else";
    PROMPT_ACKNOWLEDGED:string ="Ok";
    ALEXA_LAUNCH_SKILL:string ="Welcome,How can I help you?";
    ALEXA_SESSION_END:string ="Bye, Have a good day! ";
    GOOGLE_HOME_GREET:string ="Welcome,How can I help you?";
    GOOGLE_HOME_SESSION_END:string ="Bye, Have a good day! ";
    GOOGLE_HOME_EXCEPTION:string ="encountered a glitch. Can you say that again?";
    SERVER_CRASH:string = "Server is busy. Please try after some time"
}
export const MessageType = {
    TEXT:'Text',
    USER_INPUT:'User Input',
    BUTTON:'Button',
    AUDIO:'Audio',
    VIDEO:'Video',
    ATTACHMENT:'ATTACHMENT',
    NONE:'NONE',
    IMAGE:'Image',
    LOCATION:'Location',
    ACCESS:'Access',
    JSON_API:'JSON API',
    CAROUSEL:'Carousel',
    BLOCK_BUTTON:'BlockButton',
    CONFIRM_PROMPT_BUTTON:'Confirm Prompt Button',
    TIMEOUT:"Typing",
    REDIRECT:"Redirect",
    QUICK_REPLIES:"Quick Replies",
    QUICK_REPLIES_BUTTON:"Quick Reply Button"
}