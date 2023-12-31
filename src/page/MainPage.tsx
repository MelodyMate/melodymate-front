import React, { useEffect, MouseEvent, useState, useRef } from 'react';
import MusicModal from '../components/modals/MusicModal';
import YouTube, { YouTubeProps } from 'react-youtube';
import Button from '../components/buttons/Button';
import ChartModal from '../components/modals/ChartModal';
import useModal from '../hooks/useModal';
import ModalButton from '../components/buttons/ModalButton';
import { CdMusic, Keys, Drvspace7, Computer } from '@react95/icons';
import SignInModal from '../components/modals/SignInModal';
import SignUpModal from '../components/modals/SignUpModal';
import { useQuery } from '@tanstack/react-query';
import { fetchSongs } from '../api/api';

import { IPlayer, ISong } from '../types/types';
import { getRefetchInterval } from '../utils/utils';
import AddSongModal from '../components/modals/AddSongModal';
import useMusicPlayer from '../hooks/useMusicPlayer';
import { useMusicStore } from '../stores/useMusicStore';
import { useModalStore } from '../stores/useModalStore';

export type ModalType = 'music' | 'chart' | 'signIn' | 'signUp';

const MainPage = () => {
	const playerRef = useRef<IPlayer | null>(null);
	const { setSongs, songs, currentSongIndex, setPrevDisabled, setNextDisabled, setCurrentTime } =
		useMusicStore((state) => ({
			setSongs: state.setSongs,
			songs: state.songs,
			currentSongIndex: state.currentSongIndex,
			setPrevDisabled: state.setPrevDisabled,
			setNextDisabled: state.setNextDisabled,
			setCurrentTime: state.setCurrentTime,
		}));

	const { handleReady, handleStateChange } = useMusicPlayer({ playerRef });

	const musicModal = useModal({ isOpen: true, isMinimized: false, zIndex: 5 }, 'music');
	const chartModal = useModal(undefined, 'chart');
	const signInModal = useModal(undefined, 'signIn');
	const signUpModal = useModal(undefined, 'signUp');

	const { isLoading, data: fetchedSongs } = useQuery<ISong[], Error>(['songs'], fetchSongs, {
		staleTime: Infinity,
		refetchInterval: getRefetchInterval(),
	});

	const { openedModals } = useModalStore();
	const [showAddSongModal, setShowAddSongModal] = useState(false);

	const currentSong = songs[currentSongIndex];
	const opts: YouTubeProps['opts'] = {
		playerVars: {
			autoplay: 1,
			mute: 1,
			controls: 0,
		},
	};

	const handleAddSongClick = () => {
		setShowAddSongModal(true);
	};

	const getModalInfo = (modalType: ModalType) => {
		switch (modalType) {
			case 'music':
				return {
					isOpen: musicModal.modalState.isOpen,
					isMinimized: musicModal.modalState.isMinimized,
					toggleMinimize: musicModal.toggleMinimize,
					icon: <CdMusic className="w-auto" />,
					label: 'Music',
					onOpen: musicModal.open,
				};
			case 'chart':
				return {
					isOpen: chartModal.modalState.isOpen,
					isMinimized: chartModal.modalState.isMinimized,
					toggleMinimize: chartModal.toggleMinimize,
					icon: <Drvspace7 className="w-auto" />,
					label: 'Chart',
					onOpen: chartModal.open,
				};
			case 'signIn':
				return {
					isOpen: signInModal.modalState.isOpen,
					isMinimized: signInModal.modalState.isMinimized,
					toggleMinimize: signInModal.toggleMinimize,
					icon: <Keys className="w-auto" />,
					label: 'SignIn',
					onOpen: signInModal.open,
				};
			case 'signUp':
				return {
					isOpen: signUpModal.modalState.isOpen,
					isMinimized: signUpModal.modalState.isMinimized,
					toggleMinimize: signUpModal.toggleMinimize,
					icon: <Computer className="w-auto" />,
					label: 'SignUp',
					onOpen: signUpModal.open,
				};
			default:
				throw new Error('Unknown modal type: ' + modalType);
		}
	};

	const handleSignUpModalOpen = (event: MouseEvent<HTMLElement, globalThis.MouseEvent>) => {
		event.stopPropagation();
		signInModal.close(event);
		signUpModal.open(event);
	};
	useEffect(() => {
		if (fetchedSongs) {
			setSongs(fetchedSongs);
		}
	}, [fetchedSongs, setSongs]);

	useEffect(() => {
		setPrevDisabled(false);
		setNextDisabled(false);

		const timer = setInterval(() => {
			if (playerRef.current) {
				const newCurrentTime = Math.round(playerRef.current.getCurrentTime());
				setCurrentTime(newCurrentTime);
			}
		}, 1000);
		return () => {
			if (playerRef.current) {
				playerRef.current.stopVideo();
				playerRef.current = null;
			}
			clearInterval(timer);
		};
	}, [playerRef, setCurrentTime, setNextDisabled, setPrevDisabled]);

	return (
		<div className="flex flex-col w-full h-screen bg-black ">
			<main className="relative flex items-center justify-center w-full h-full">
				{currentSong && musicModal.modalState.isOpen && (
					<MusicModal
						open={musicModal.modalState.isOpen}
						style={{
							zIndex: musicModal.modalState.zIndex,
							display: musicModal.modalState.isMinimized ? 'none' : undefined,
						}}
						onOpen={musicModal.open}
						onClose={musicModal.close}
						onMinimize={musicModal.toggleMinimize}
						handleAddSongClick={handleAddSongClick}
						openChartModal={chartModal.open}
						openSignInModal={signInModal.open}
						currentSongIndex={currentSongIndex}
						songs={songs}
						isLoading={isLoading}
						playerRef={playerRef}
					/>
				)}
				{chartModal.modalState.isOpen && (
					<ChartModal
						open={chartModal.modalState.isOpen}
						onOpen={chartModal.open}
						onClose={chartModal.close}
						onMinimize={chartModal.toggleMinimize}
						handleAddSongClick={handleAddSongClick}
						style={{
							zIndex: chartModal.modalState.zIndex,
							display: chartModal.modalState.isMinimized ? 'none' : undefined,
						}}
						playerRef={playerRef}
					/>
				)}
				{signInModal.modalState.isOpen && (
					<SignInModal
						open={signInModal.modalState.isOpen}
						style={{
							zIndex: signInModal.modalState.zIndex,
							display: signInModal.modalState.isMinimized ? 'none' : undefined,
						}}
						onOpen={signInModal.open}
						handleSignUpModalOpen={handleSignUpModalOpen}
						onClose={signInModal.close}
						onMinimize={signInModal.toggleMinimize}
					/>
				)}

				{signUpModal.modalState.isOpen && (
					<SignUpModal
						open={signUpModal.modalState.isOpen}
						style={{
							zIndex: signUpModal.modalState.zIndex,
							display: signUpModal.modalState.isMinimized ? 'none' : undefined,
						}}
						onOpen={signUpModal.open}
						onClose={signUpModal.close}
						onMinimize={signUpModal.toggleMinimize}
						handleSignInModalOpen={signInModal.open}
					/>
				)}
				<AddSongModal
					isOpen={showAddSongModal}
					onClose={() => setShowAddSongModal(false)}
				/>
				{currentSong && (
					<YouTube
						iframeClassName="w-full h-full flex-grow"
						className="w-full h-full pointer-events-none"
						videoId={new URL(currentSong.url).searchParams.get('v') || ''}
						opts={opts}
						onReady={handleReady}
						onStateChange={handleStateChange}
					/>
				)}
			</main>

			<footer className="flex items-center w-full h-10 px-7 bg-retroGray">
				<div className="relative flex items-center h-full">
					<Button
						onClick={musicModal.open}
						className={`text-[14px] flex items-center justify-center  font-eng mr-4 border-none w-7 h-7 after:absolute after:top-1/2 after:-translate-y-1/2 after:right-2 after:w-[3px]  after:h-7 after:bg-retroGray after:border  after:border-b-black after:border-r-black after:border-l-white after:border-t-white`}
					>
						<div className="w-6">
							<CdMusic className="w-auto" />
						</div>
					</Button>
				</div>
				<div className="flex">
					{openedModals.map((modalType) => {
						const modalInfo = getModalInfo(modalType);

						return (
							<ModalButton
								key={modalType}
								modalType={modalType}
								open={modalInfo.isOpen}
								isMinimized={modalInfo.isMinimized}
								toggleMinimize={modalInfo.toggleMinimize}
								icon={modalInfo.icon}
								label={modalInfo.label}
								onOpen={modalInfo.onOpen}
							/>
						);
					})}
				</div>
			</footer>
		</div>
	);
};

export default MainPage;
