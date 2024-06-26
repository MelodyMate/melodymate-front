import React, { MouseEventHandler, useEffect, useRef } from 'react';
import Modal from './Modal';
import ProgressBar from '../ProgressBar';
import VolumeBar from '../volumebar/VolumeBar';
import Button, { IButtonProps } from '../buttons/Button';
import ButtonGroup from '../buttons/ButtonGroup';
import { INavItemProps } from '../NavItem';
import Navigation from '../Navigation';
import he from 'he';
import { formatTime, handleImageError, truncateTitle } from '../../utils/utils';
import { IPlayer, ISong } from '../../types/types';
import Frame from '../Frame';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faGear,
	faPause,
	faPlay,
	faPlus,
	faStepBackward,
	faStepForward,
	faUser,
} from '@fortawesome/free-solid-svg-icons';
import useMusicPlayer from '../../hooks/useMusicPlayer';
import { useMusicStore } from '../../stores/useMusicStore';
import { useModalStore } from '../../stores/useModalStore';
import { ModalType } from '../../types/modalTypes';
import { MODAL_CONFIGS } from '../../configs/modalConfigs';

interface IMusicPlayerModalProps {
	open: boolean;
	style: React.CSSProperties;
	onOpen: MouseEventHandler<HTMLDivElement>;
	onClose: MouseEventHandler<HTMLButtonElement>;
	onMinimize: MouseEventHandler<HTMLButtonElement>;
	currentSongIndex: number;
	songs: ISong[];
	isLoading: boolean;
	playerRef: React.MutableRefObject<IPlayer | null>;
}

const MusicModal = ({
	open,
	onClose,
	onMinimize,
	onOpen,
	currentSongIndex,
	songs,
	style,
	isLoading,
	playerRef,
}: IMusicPlayerModalProps) => {
	const musicModalRef = useRef(null);
	const { icon: IconComponent, label: title, key: musicKey } = MODAL_CONFIGS.music;
	const { key: chartKey } = MODAL_CONFIGS.chart;
	const { key: signInKey } = MODAL_CONFIGS.signIn;
	const { key: addSongKey } = MODAL_CONFIGS.addSong;

	const { openModal } = useModalStore();

	const { isPrevDisabled, isNextDisabled, isPlayButton, currentTime, duration } = useMusicStore(
		(state) => ({
			isPrevDisabled: state.isPrevDisabled,
			isNextDisabled: state.isNextDisabled,
			isPlayButton: state.isPlayButton,
			currentTime: state.currentTime,
			duration: state.duration,
		}),
	);

	const { handlePlayClick, handlePauseClick, handleNextSong, handlePrevSong } = useMusicPlayer({
		playerRef,
	});

	const currentSong = songs[currentSongIndex];
	const currentSongTitle =
		isLoading || !currentSong
			? 'Loading...'
			: truncateTitle(he.decode(currentSong.musicTitle || 'Unknown Title'));

	const currentSongArtist =
		isLoading || !currentSong ? 'Please wait...' : currentSong.artist || 'Unknown Artist';

	const thumbnailImage =
		isLoading || !currentSong
			? '/no-thumbnail.png'
			: currentSong.thumbnail || '/no-thumbnail.png';

	const handleOpenChartModal = () => {
		openModal(chartKey as ModalType);
	};

	const handleOpenSignInModal = () => {
		openModal(signInKey as ModalType);
	};

	const handleOpenAddSongModal = () => {
		openModal(addSongKey as ModalType);
	};

	useEffect(() => {
		if (playerRef.current && songs[currentSongIndex]) {
			playerRef.current.src = songs[currentSongIndex].url;
			if (typeof playerRef.current.play === 'function') {
				playerRef.current.play();
			}
		}
	}, [currentSongIndex, songs, playerRef]);

	const musicModalnavItems: INavItemProps[] = [
		{ shortcut: 'c', label: 'hart', onClick: handleOpenChartModal },
		{ shortcut: 'p', label: 'laylist' },
	];

	const musicControlbuttons: IButtonProps[] = [
		{
			className: `w-[60px] xl:w-[75px] ${
				isPrevDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
			}`,
			disabled: isPrevDisabled,
			onClick: handlePrevSong,
			children: <FontAwesomeIcon icon={faStepBackward} />,
		},
		{
			className: 'w-[65px] xl:w-[80px] cursor-pointer',
			onClick: isPlayButton ? handlePlayClick : handlePauseClick,
			children: isPlayButton ? (
				<FontAwesomeIcon icon={faPlay} />
			) : (
				<FontAwesomeIcon icon={faPause} />
			),
		},
		{
			className: `w-[60px] xl:w-[75px] ${
				isNextDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
			}`,
			disabled: isNextDisabled,
			onClick: handleNextSong,
			children: <FontAwesomeIcon icon={faStepForward} />,
		},
	];
	const userControlbuttons: IButtonProps[] = [
		{
			className: 'md:w-[65px] xl:w-[75px] w-1/2',
			onClick: handleOpenSignInModal,
			children: <FontAwesomeIcon icon={faUser} />,
		},
		{
			className: 'md:w-[65px] xl:w-[75px] w-1/2',
			children: <FontAwesomeIcon icon={faGear} />,
		},
	];

	return (
		<Modal
			className="absolute"
			open={open}
			onClose={onClose}
			onMinimize={onMinimize}
			onOpen={onOpen}
			icon={<IconComponent />}
			title={title}
			modalRef={musicModalRef}
			style={style}
			modalKey={musicKey as ModalType}
		>
			<Navigation navItems={musicModalnavItems} onClick={handleOpenChartModal} />

			<Frame
				className="md:w-[520px] py-4 px-4 xl:py-[19px] xl:px-[21px] xl:w-[620px]"
				boxShadow="in"
				bg="retroGray"
			>
				<div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-[20px]">
					<div className="hidden md:flex-col md:flex md:space-y-0">
						<div className="flex-shrink-0 h-[118px] w-[214px] bg-black flex justify-center items-center overflow-hidden">
							<img
								className="w-full"
								src={thumbnailImage}
								onError={handleImageError}
								alt={isLoading ? 'loading' : currentSongTitle}
							/>
						</div>
					</div>
					<div className="w-full">
						<div className="text-xl font-extrabold font-kor">{currentSongTitle}</div>
						<div className="font-kor font-semibold mb-[24px]">{currentSongArtist}</div>
						<ProgressBar className="h-[4px] mb-[17px]" playerRef={playerRef} />
						<div className="flex items-center justify-between">
							<div>{`${formatTime(currentTime)} / ${formatTime(duration)}`}</div>
							<VolumeBar playerRef={playerRef} />
						</div>
					</div>
				</div>
				<div className="md:flex md:justify-between">
					<div className="flex justify-between mt-[20px]  md:order-2">
						<ButtonGroup buttons={musicControlbuttons} />
						<Button
							className="w-[60px] xl:w-[80px] xl:ml-[33px] flex justify-center items-center ml-[10px]"
							onClick={handleOpenAddSongModal}
						>
							<FontAwesomeIcon icon={faPlus} />
						</Button>
					</div>
					<ButtonGroup
						buttons={userControlbuttons}
						className="mt-[5px] md:mt-[20px] md:order-1"
					/>
				</div>
				{/* </>
				)} */}
			</Frame>
			<p className="font-medium font-kor text-[13px] flex justify-end pt-[6px] pb-[5px]">
				Hello, World
			</p>
		</Modal>
	);
};

export default MusicModal;
