import { ChatAppResponse, ChatAppResponseOrError, ChatAppRequest,ClearChatAppRequest,SummaryAppRequest, Config } from "./models";
import { BACKEND_URI } from "./BACKEND_URI";

function getHeaders(): Record<string, string> {
    var headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    return headers;
}

export async function chatApi(request: ChatAppRequest): Promise<Response> {
    const body = JSON.stringify(request);
    return await fetch(`${BACKEND_URI}/ai`, {
        method: "POST",
        mode: "cors",
        headers: getHeaders(),
        body: body
    });
}

export async function fetchSummary(request: SummaryAppRequest): Promise<Response> {
    const body = JSON.stringify(request);
    return await fetch(`${BACKEND_URI}/summary`, {
        method: "POST",
        mode: "cors",
        headers: getHeaders(),
        body: body
    });
}

export const clearChatApi = async (request: ClearChatAppRequest): Promise<Response> => {
    const response = await fetch(`${BACKEND_URI}/clear`, {
        method: 'DELETE',
        headers: getHeaders(),        
        body: JSON.stringify(request),
    });
    return response;
};

export function getCitationFilePath(citation: string): string {
    return `${BACKEND_URI}/content/${citation}`;
}
