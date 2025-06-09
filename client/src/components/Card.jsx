import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InfoIcon from '@mui/icons-material/Info';  
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';

const Card = ({ user, badges, challenges }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  if (!user) return <LoadingState>Loading...</LoadingState>;
  
  // Calculer le niveau de l'utilisateur en fonction de ses points
  const level = getLevel(user.points || 0);
  
  // Calculer le pourcentage vers le prochain niveau
  const nextLevel = getNextLevel(level.name);
  const progressToNextLevel = calculateProgressToNextLevel(user.points, level.name, nextLevel);
   
  return (
    <StyledWrapper>
      <DashboardCard>
        <CardHeader>
          <div className="user-info">
            <AvatarCircle>{user.nomPrenom ? user.nomPrenom.charAt(0).toUpperCase() : "U"}</AvatarCircle>
            <div className="user-details">
              <h2>Welcome, {user.nomPrenom}</h2>
              <LevelInfo>
                <PointsBadge>{user.points} Points</PointsBadge>
                <LevelBadge level={level.name}>
                  {level.icon} Level  {level.name}
                </LevelBadge>
                <Tooltip 
                  title="View details about the points and levels system" 
                  TransitionComponent={Zoom} 
                  arrow
                >
                  <IconButton onClick={handleOpen} aria-label="infos" size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </LevelInfo>
            </div>
          </div>
          <ProgressContainer>
            <ProgressLabel>
            Progress toward  {nextLevel.name} {nextLevel.icon}
            </ProgressLabel>
            <StyledLinearProgress 
              variant="determinate" 
              value={progressToNextLevel}
              color="primary"
            />
            <ProgressText>{progressToNextLevel}%</ProgressText>
          </ProgressContainer>
        </CardHeader>
        
        <CardContent>
          <SectionContainer>
            <SectionTitle>
              <SectionIcon>🎖️</SectionIcon>
              Badges
            </SectionTitle>
            {badges.length > 0 ? (
              <BadgeContainer>
                {badges.map((badge, index) => (
                  <BadgeItem key={index}>
                    <BadgeImage src={`/badges/${badge.icon}`} alt={badge.name} />
                    <BadgeName>{badge.name}</BadgeName>
                  </BadgeItem>
                ))}
              </BadgeContainer>
            ) : (
              <EmptyState>
                <EmptyStateIcon>🏅</EmptyStateIcon>
                <EmptyStateText>Complete actions to earn your first badges</EmptyStateText>
              </EmptyState>
            )}
          </SectionContainer>

          <SectionContainer>
            <SectionTitle>
              <SectionIcon>🏆</SectionIcon>
              Ongoing Challenges
            </SectionTitle>
            {challenges.length > 0 ? (
              <ChallengesContainer>
                {challenges.map((challenge, index) => (
                  <ChallengeItem key={index}>
                    <ChallengeName>{challenge.name}</ChallengeName>
                    <ChallengeProgress>
                      <LinearProgress 
                        variant="determinate" 
                        value={(challenge.progress / challenge.target) * 100}
                        color="secondary"
                      />
                      <ChallengeStats>
                        <span>{challenge.progress}/{challenge.target}</span>
                        <span>{Math.round((challenge.progress / challenge.target) * 100)}%</span>
                      </ChallengeStats>
                    </ChallengeProgress>
                  </ChallengeItem>
                ))}
              </ChallengesContainer>
            ) : (
              <EmptyState>
                <EmptyStateIcon>📈</EmptyStateIcon>
                <EmptyStateText>Join your first challenges to progress</EmptyStateText>
              </EmptyState>
            )}
          </SectionContainer>
        </CardContent>
      </DashboardCard>

      <Modal open={open} onClose={handleClose}>
        <StyledModalBox>
          <ModalTitle>🌟 Levels & Rewards System</ModalTitle>
          <ModalContent>
            <LevelList>
              <LevelItem>🌱 Level 1 - Beginner: 0 points</LevelItem>
              <LevelItem>🚀 Level 2 - Advanced: 100 points</LevelItem>
              <LevelItem>🎓 Level 3 - Expert: 250 points</LevelItem>
              <LevelItem>🔥 Level 4 - Master: 500 points</LevelItem>
              <LevelItem>🏅 Level 5 - Legend: 1000 points</LevelItem>
            </LevelList>
            
            <RewardSection>
  <RewardTitle>🟫 How to Earn Points:</RewardTitle>
  <RewardItem>🔐 +20 points for signing up → Badge: "New Beginning"</RewardItem>
  <RewardItem>📅 +15 points for uploading your schedule → Badge: "Organized"</RewardItem>
  <RewardItem>✅ To-do tasks: +5 pts each, +10 pts if completed → Badge: "Organized Student"</RewardItem>
  <RewardItem>🎯 Challenges: "Master Organizer" (3 tasks/day for 7 days), "Weekly Planner" (5 tasks before Sunday)</RewardItem>
  <RewardItem>📚 Academic Chatbot: +5 pts/question </RewardItem>
  <RewardItem>📝 Course PDFs: +10 pts for upload, +5 pts for summarizing → Badge: "Pro of Revision", Challenge: "Top Reviser"</RewardItem>
  <RewardItem>📂 Share documents: +30 pts/validated doc → Badge: "Committed Sharer", Challenge: "Knowledge Sharer"</RewardItem>
  <RewardItem>💬 Positive Chatbot: +5 pts/message → Badge: "Always Motivated", Challenge: "Positive Vibes Champion"</RewardItem>
</RewardSection>

          </ModalContent>
        </StyledModalBox>
      </Modal>
    </StyledWrapper>
  );
};

// Fonctions utilitaires
function getLevel(points) {
  if (points >= 1000) return { name: "Legend", icon: "🏅" };
  if (points >= 500) return { name: "Master", icon: "🔥" };
  if (points >= 250) return { name: "Expert", icon: "🎓" };
  if (points >= 100) return { name: "Advanced", icon: "🚀" };
  return { name: "Beginner", icon: "🌱" };
}

function getNextLevel(currentLevel) {
  switch(currentLevel) {
    case "Beginner": return { name: "Advanced", icon: "🚀", points: 100 };
    case "Advanced": return { name: "Expert", icon: "🎓", points: 250 };
    case "Expert": return { name: "Master", icon: "🔥", points: 500 };
    case "Master": return { name: "Legend", icon: "🏅", points: 1000 };
    case "Legend": return { name: "Legend", icon: "🏅", points: 1000 }; // Already at max
    default: return { name: "Advanced", icon: "🚀", points: 100 };
  }
}

function calculateProgressToNextLevel(currentPoints, currentLevelName, nextLevel) {
  // Determine points for current and next levels
  let currentLevelPoints = 0;
  switch(currentLevelName) {
    case "Beginner": currentLevelPoints = 0; break;
    case "Advanced": currentLevelPoints = 100; break;
    case "Expert": currentLevelPoints = 250; break;
    case "Master": currentLevelPoints = 500; break;
    case "Legend": currentLevelPoints = 1000; break;
    default: currentLevelPoints = 0;
  }

  // Already at max level
  if (currentLevelName === "Legend") return 100;

  // Calculate percentage
  const pointsNeeded = nextLevel.points - currentLevelPoints;
  const pointsGained = currentPoints - currentLevelPoints;
  const percentage = Math.round((pointsGained / pointsNeeded) * 100);

  return Math.min(percentage, 100); // Ensure percentage doesn't exceed 100
}


// Composants stylisés
const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 2rem;

  font-family: 'Roboto', 'Segoe UI', system-ui, sans-serif;
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  width: 100%;
  font-size: 18px;
  color: #666;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const DashboardCard = styled.div`
  width: 100%;
  max-width: 960px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
`;

const CardHeader = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #1976d2, #2196f3);
  color: #fff;

  .user-info {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 16px;
  }

  .user-details {
    h2 {
      margin: 0;
      font-weight: 500;
      font-size: 24px;
    }
  }
`;

const AvatarCircle = styled.div`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 28px;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
`;

const LevelInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
`;

const PointsBadge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
`;

const LevelBadge = styled.span`
  background: ${props => {
    switch(props.level) {
      case 'Beginner': return 'rgba(76, 175, 80, 0.8)';
      case 'Advanced': return 'rgba(33, 150, 243, 0.8)';
      case 'Expert': return 'rgba(156, 39, 176, 0.8)';
      case 'Master': return 'rgba(255, 152, 0, 0.8)';
      case 'Legend': return 'rgba(233, 30, 99, 0.8)';
      default: return 'rgba(76, 175, 80, 0.8)';
    }
  }};
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
`;

const ProgressContainer = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProgressLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StyledLinearProgress = styled(LinearProgress)`
  height: 10px;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.2);

  .MuiLinearProgress-bar {
    background-color: rgba(255, 255, 255, 0.8);
  }
`;

const ProgressText = styled.div`
  font-size: 12px;
  text-align: right;
`;

const CardContent = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
`;

const SectionIcon = styled.span`
  font-size: 24px;
`;

const BadgeContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 20px;
  justify-content: flex-start;
`;

const BadgeItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const BadgeImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  background-color: #f5f7fa;
  padding: 8px;
  object-fit: contain;
`;

const BadgeName = styled.span`
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
`;

const ChallengesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ChallengeItem = styled.div`
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ChallengeName = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const ChallengeProgress = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ChallengeStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: #f9f9f9;
  border-radius: 12px;
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  font-size: 36px;
  margin-bottom: 12px;
`;

const EmptyStateText = styled.p`
  margin: 0;
  font-size: 16px;
  color: #666;
`;

const StyledModalBox = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 500px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  padding: 24px;
  outline: none;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled(Typography)`
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1976d2;
  text-align: center;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const LevelList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LevelItem = styled.li`
  font-size: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RewardSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RewardTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 500;
  color: #1976d2;
`;

const RewardItem = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: #333;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
`;

export default Card;