import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { Stack, TextField } from "@fluentui/react";
import { Button, Tooltip, Field, Textarea } from "@fluentui/react-components";
import { Send28Filled } from "@fluentui/react-icons";

import styles from "./QuestionInput.module.css";

interface Props {
    onSend: (question: string) => void;
    disabled: boolean;
    initQuestion?: string;
    placeholder?: string;
    clearOnSend?: boolean;
}

export const QuestionInput = ({ onSend, disabled, placeholder, clearOnSend, initQuestion }: Props) => {
    const [question, setQuestion] = useState<string>("");

    useEffect(() => {
        initQuestion && setQuestion(initQuestion);
    }, [initQuestion]);

    const sendQuestion = () => {
        if (disabled || !question.trim()) {
            return;
        }

        onSend(question);

        if (clearOnSend) {
            setQuestion("");
        }
    };

    const onEnterPress = (ev: React.KeyboardEvent<Element>) => {
        if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            sendQuestion();
        }
    };

    const onQuestionChange = (_ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        if (!newValue) {
            setQuestion("");
        } else if (newValue.length <= 1000) {
            setQuestion(newValue);
        }
    };

    const { instance } = useMsal();
    const disableRequiredAccessControl = false; //requireAccessControl && !isLoggedIn(instance);
    const sendQuestionDisabled = disabled || !question.trim() || disableRequiredAccessControl;

    if (disableRequiredAccessControl) {
        placeholder = "Please login to continue...";
    }

    return (
        <Stack horizontal className={styles.questionInputContainer}>
            <TextField
                className={styles.questionInputTextArea}
                disabled={disableRequiredAccessControl}
                placeholder={placeholder}
                multiline
                resizable={false}
                borderless
                value={question}
                onChange={onQuestionChange}
                onKeyDown={onEnterPress}
            />
            <div className={styles.questionInputButtonsContainer}>
                <Tooltip content="Ask question button" relationship="label">
                    <Button size="large" icon={<Send28Filled primaryFill="rgb(143, 27, 78)" />} disabled={sendQuestionDisabled} onClick={sendQuestion} />
                </Tooltip>
            </div>
        </Stack>
    );
};
