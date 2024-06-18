import React, { useEffect, useState } from 'react';
import  Chat  from '../chat/Chat';
import styles from './Agent.module.css';
import { SummaryAppRequest, SummaryResponse, fetchSummary } from '../../api';
import { useParams } from 'react-router-dom';


const AgentView = () => {
    const [summary, setSummary] = useState('');
    const { sessionId } = useParams<{ sessionId: any }>(); 

    useEffect(() => {
       
        const getSummary = async () => {
            const request: SummaryAppRequest = {                
                session_id: sessionId
            };

            const response = await fetchSummary(request);      
            const contentType = response.headers.get("content-type");
            if (!response.body) {
                throw Error("No response body");
            } else if (contentType?.indexOf('text/html') !== -1 || contentType?.indexOf('text/plain') !== -1) {
                const bodyText = await response.text();
                console.error(`Chat Error: ${bodyText}`);                            
            }else {
                const parsedResponse: SummaryResponse = await response.json();
                const summaryData= parsedResponse.message;
                if (summaryData && Object.keys(summaryData).length > 0) { 
                    setSummary(summaryData);
                }
            }
            
        };

        getSummary();
    }, [sessionId]);

    return (
        <div className={styles.container}>
            <div className={styles.chatContainer}>
                <Chat />                
            </div>      
            <div className={styles.summaryContainer}>
                    
                {summary && Object.keys(summary).length > 0 && (
                    <>
                        <h2>Conversation Summary</h2>
                        <pre>{summary}</pre> {/* Using <pre> to preserve newlines */}
                    </>
                )}
            </div>    
        </div>
    );
};

export default AgentView;
