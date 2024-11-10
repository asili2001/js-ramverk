import React, { useState } from 'react';
import Input from '../../components/Input';
import { FaShare, FaXmark } from 'react-icons/fa6';
import Switch, { Option } from '../../components/Input/Switch';
import { BiBookReader } from 'react-icons/bi';
import { FiEdit3 } from 'react-icons/fi';
import { ApolloError, useMutation, useQuery } from '@apollo/client';
import { GET_DOCUMENT_USERS, SHARE_DOCUMENT } from '../../api/queries';
import LoadingSpinner from '../../components/Loading';
import toast from 'react-hot-toast';

interface IDocShare {
        onClose: () => void;
        document: Doc | null;
}

const DocShare: React.FC<IDocShare> = ({ onClose, document }) => {
        const [email, setEmail] = useState<string>('');
        const [docUsers, setDocUsers] = useState<UserWithAccess[] | undefined>(
                document?.usersWithAccess
        );
        const getDocumentUsers = useQuery(GET_DOCUMENT_USERS, { variables: { docId: document?.id } });

        const [shareDoc] = useMutation(SHARE_DOCUMENT);

        const accessLevelOptions: Option[] = [
                {
                        title: 'Reader',
                        value: 'reader',
                        icon: BiBookReader,
                },
                {
                        title: 'Editor',
                        value: 'editor',
                        icon: FiEdit3,
                },
        ];

        const handleDocShare = async (value: string, id: string) => {
                if (!document) return;
                try {
                        const { data } = await shareDoc({
                                variables: { docId: document.id, shareWithEmail: id, accessLevel: value },
                        });
                        const shareDocResponse = data?.shareDocument;

                        if (shareDocResponse) {
                                const x = await getDocumentUsers.refetch();
                                setDocUsers(x.data.getDocument.usersWithAccess);
                        }
                } catch (err) {
                        let errorMessage = '';
                        if (err instanceof ApolloError) {
                                errorMessage = err.message;
                                toast.error(errorMessage);
                        } else {
                                toast.error("'An unknown error occurred");
                        }
                }
        };

        return (
                <div className="doc-share">
                        <div className="container">
                                <div className="header">
                                        <h1>Share Document</h1>
                                        <button className="primary-button" onClick={onClose}>
                                                <FaXmark />
                                        </button>
                                </div>
                                <div className="body">
                                        <div className="add-new">
                                                <Input
                                                        type="email"
                                                        id="email"
                                                        placeholder=" "
                                                        title="Email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.currentTarget.value)}
                                                        autoComplete="off"
                                                />
                                                <button
                                                        disabled={email.length < 1}
                                                        className={`submit primary-button ${email.length < 1 ? 'disabled' : 'active'}`}
                                                        onClick={() => handleDocShare('reader', email)}
                                                >
                                                        <FaShare />
                                                </button>
                                        </div>
                                        <ul className="share-list">
                                                {getDocumentUsers.loading && <LoadingSpinner />}
                                                {!getDocumentUsers.loading &&
                                                        docUsers &&
                                                        docUsers
                                                                .filter((access) => access.accessLevel !== 'owner')
                                                                .map((access, index) => (
                                                                        <li key={index}>
                                                                                <p>{access.user.email}</p>
                                                                                <Switch
                                                                                        id={access.user.email}
                                                                                        onChange={handleDocShare}
                                                                                        defaultOption={access.accessLevel}
                                                                                        options={accessLevelOptions}
                                                                                />
                                                                        </li>
                                                                ))}
                                        </ul>
                                </div>
                        </div>
                </div>
        );
};

export default DocShare;
