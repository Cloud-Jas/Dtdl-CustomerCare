import { useEffect, useState } from "react";
import { ChoiceGroup, IChoiceGroupOption, Stack, IDropdownOption, Dropdown } from "@fluentui/react";

import styles from "./VectorSettings.module.css";
import { RetrievalMode, VectorFieldOptions } from "../../api";

interface Props {
    showImageOptions?: boolean;
    updateRetrievalMode: (retrievalMode: RetrievalMode) => void;
    updateVectorFields: (options: VectorFieldOptions[]) => void;
}

const vectorFields: IChoiceGroupOption[] = [
    {
        key: VectorFieldOptions.Embedding,
        text: "Text Embeddings"
    },
    {
        key: VectorFieldOptions.ImageEmbedding,
        text: "Image Embeddings"
    },
    {
        key: VectorFieldOptions.Both,
        text: "Text and Image embeddings"
    }
];

export const VectorSettings = ({ updateRetrievalMode, updateVectorFields, showImageOptions }: Props) => {
    const [retrievalMode, setRetrievalMode] = useState<RetrievalMode>(RetrievalMode.Hybrid);
    const [vectorFieldOption, setVectorFieldOption] = useState<string>();

    const onVectorFieldsChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, option?: IChoiceGroupOption) => {
        option && setVectorFieldOption(option.key);
        let list;
        if (option?.key === "both") {
            list = [VectorFieldOptions.Embedding, VectorFieldOptions.ImageEmbedding];
        } else {
            list = [option?.key as VectorFieldOptions];
        }
        updateVectorFields(list);
    };

    useEffect(() => {
        showImageOptions
            ? updateVectorFields([VectorFieldOptions.Embedding, VectorFieldOptions.ImageEmbedding])
            : updateVectorFields([VectorFieldOptions.Embedding]);
    }, [showImageOptions]);

    return (
        <Stack className={styles.container} tokens={{ childrenGap: 10 }}>
            {showImageOptions && [RetrievalMode.Vectors, RetrievalMode.Hybrid].includes(retrievalMode) && (
                <ChoiceGroup
                    options={vectorFields}
                    onChange={onVectorFieldsChange}
                    selectedKey={vectorFieldOption}
                    defaultSelectedKey={VectorFieldOptions.Both}
                    label="Vector Fields (Multi-query vector search)"
                />
            )}
        </Stack>
    );
};
