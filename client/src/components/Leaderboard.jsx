import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { CircularProgress, Tooltip } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PersonIcon from "@mui/icons-material/Person";

const Leaderboard = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/leaderboards/top-users")
      .then((response) => {
        console.log("Data received :", response.data);
        // Filtrage des utilisateurs selon le rôle
        const filteredUsers = response.data.filter(user => user.role === "user");
        setTopUsers(filteredUsers);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error when loading the classification.");
        setLoading(false);
        console.error("Error API:", err);
      });
  }, []);

  // Obtenir l'initiale du nom de l'utilisateur pour l'avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  // Obtenir la couleur d'arrière-plan de l'avatar en fonction du rang
  const getAvatarBackground = (index) => {
    if (index === 0) return "#FFD700"; // Or pour le 1er
    if (index === 1) return "#C0C0C0"; // Argent pour le 2ème
    if (index === 2) return "#CD7F32"; // Bronze pour le 3ème
    return "#E0E0E0"; // Gris pour les autres
  };

  // Obtenir les médailles pour les trois premiers
  const getMedalEmoji = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return null;
  };

  if (error) {
    return (
      <ErrorContainer>
        <ErrorIcon>⚠️</ErrorIcon>
        <ErrorMessage>{error}</ErrorMessage>
        <RetryButton onClick={() => window.location.reload()}>
          Try again
        </RetryButton>
      </ErrorContainer>
    );
  }

  return (
    <LeaderboardContainer>
      <LeaderboardHeader>
        <TrophyIcon>🏆</TrophyIcon>
        <HeaderTitle>Student ranking</HeaderTitle>
      </LeaderboardHeader>

      {loading ? (
        <LoadingContainer>
          <CircularProgress color="primary" size={40} />
          <LoadingText>Loading the ranking ...</LoadingText>
        </LoadingContainer>
      ) : topUsers.length === 0 ? (
        <EmptyStateContainer>
          <EmptyStateIcon>📊</EmptyStateIcon>
          <EmptyStateMessage>
          No user in the ranking for the moment.
          </EmptyStateMessage>
        </EmptyStateContainer>
      ) : (
        <>
          <TopThreeContainer>
            {topUsers.slice(0, 3).map((user, index) => (
              <TopUserCard key={user.id} position={index}>
                <MedalBadge>{getMedalEmoji(index)}</MedalBadge>
                <TopUserAvatar bgColor={getAvatarBackground(index)}>
                  {getInitial(user.nomPrenom)}
                </TopUserAvatar>
                <TopUserName>{user.nomPrenom}</TopUserName>
                <TopUserPoints>
                  <EmojiEventsIcon fontSize="small" />
                  {user.points} pts
                </TopUserPoints>
                <TopUserRank>Rank #{index + 1}</TopUserRank>
              </TopUserCard>
            ))}
          </TopThreeContainer>

          <TableContainer>
            <LeaderboardTable>
              <TableHead>
                <tr>
                  <RankHeader>Rank</RankHeader>
                  <NameHeader>Student</NameHeader>
                  <PointsHeader>Points</PointsHeader>
                </tr>
              </TableHead>
              <TableBody>
                {topUsers.map((user, index) => (
                  <TableRow key={user.id} topRank={index < 3}>
                    <RankCell>
                      <RankWrapper>
                        <RankNumber>{index + 1}</RankNumber>
                        {getMedalEmoji(index) && (
                          <MedalIcon>{getMedalEmoji(index)}</MedalIcon>
                        )}
                      </RankWrapper>
                    </RankCell>
                    <NameCell>
                      <UserWrapper>
                        <UserAvatar bgColor={getAvatarBackground(index)}>
                          {getInitial(user.nomPrenom)}
                        </UserAvatar>
                        <UserName>{user.nomPrenom}</UserName>
                      </UserWrapper>
                    </NameCell>
                    <PointsCell>
                      <PointsBadge topRank={index < 3}>
                        {user.points} pts
                      </PointsBadge>
                    </PointsCell>
                  </TableRow>
                ))}
              </TableBody>
            </LeaderboardTable>
          </TableContainer>

          <LeaderboardFooter>
            <FooterText>
            Continue to participate to improve your ranking!
            </FooterText>
          </LeaderboardFooter>
        </>
      )}
    </LeaderboardContainer>
  );
};

// Styled Components
const LeaderboardContainer = styled.div`
  width: 90%;
  max-width: 900px;
  margin: 20px auto;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
`;

const LeaderboardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  background: linear-gradient(135deg, #1976d2, #2196f3);
  color: white;
`;

const TrophyIcon = styled.span`
  font-size: 28px;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
`;

const TopThreeContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 30px 20px;
  background: #f8f9fa;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const TopUserCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: ${(props) => (props.position === 0 ? "220px" : "200px")};
  padding: ${(props) => (props.position === 0 ? "24px" : "20px")};
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  order: ${(props) => {
    // Place the first-place user in the middle
    if (props.position === 0) return 2;
    if (props.position === 1) return 1;
    if (props.position === 2) return 3;
    return props.position + 1;
  }};
  transform: ${(props) => (props.position === 0 ? "translateY(-15px)" : "none")};

  &:hover {
    transform: ${(props) =>
      props.position === 0 ? "translateY(-22px)" : "translateY(-7px)"};
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 768px) {
    width: 90%;
    max-width: 220px;
    order: ${(props) => props.position + 1};
    transform: none;

    &:hover {
      transform: translateY(-7px);
    }
  }
`;

const MedalBadge = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 26px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
`;

const TopUserAvatar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background-color: ${(props) => props.bgColor};
  color: white;
  font-size: 32px;
  font-weight: bold;
  border-radius: 50%;
  margin-bottom: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
`;

const TopUserName = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 8px;
  color: #333;
`;

const TopUserPoints = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 8px;
`;

const TopUserRank = styled.div`
  font-size: 14px;
  color: #666;
`;

const TableContainer = styled.div`
  padding: 0 24px 24px;
  overflow-x: auto;
`;

const LeaderboardTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 16px;
`;

const TableHead = styled.thead`
  tr {
    display: grid;
    grid-template-columns: 100px 1fr 120px;
    width: 100%;
  }
`;

const RankHeader = styled.th`
  padding: 16px;
  text-align: left;
  color: #666;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  border-bottom: 2px solid #eee;
`;

const NameHeader = styled.th`
  padding: 16px;
  text-align: left;
  color: #666;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  border-bottom: 2px solid #eee;
`;

const PointsHeader = styled.th`
  padding: 16px;
  text-align: right;
  color: #666;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  border-bottom: 2px solid #eee;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  display: grid;
  grid-template-columns: 100px 1fr 120px;
  width: 100%;
  transition: all 0.2s ease;
  background: ${(props) => (props.topRank ? "#f9f9ff" : "white")};

  &:hover {
    background: ${(props) => (props.topRank ? "#f0f0ff" : "#f9f9f9")};
  }
`;

const RankCell = styled.td`
  padding: 16px;
  border-bottom: 1px solid #eee;
`;

const RankWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RankNumber = styled.span`
  font-weight: 600;
  color: #333;
  font-size: 16px;
`;

const MedalIcon = styled.span`
  font-size: 20px;
`;

const NameCell = styled.td`
  padding: 16px;
  border-bottom: 1px solid #eee;
`;

const UserWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: ${(props) => props.bgColor};
  color: white;
  font-size: 18px;
  font-weight: bold;
  border-radius: 50%;
  flex-shrink: 0;
`;

const UserName = styled.span`
  font-weight: 500;

  color: #333;
`;

const PointsCell = styled.td`
  padding: 16px;
  border-bottom: 1px solid #eee;
  text-align: right;
`;

const PointsBadge = styled.span`
  background: ${(props) => (props.topRank ? "#e3f2fd" : "#f5f5f5")};
  color: ${(props) => (props.topRank ? "#1976d2" : "#666")};
  padding: 6px 12px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 14px;
`;

const LeaderboardFooter = styled.div`
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  text-align: center;
`;

const FooterText = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
`;

// Loading state
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 16px;
`;

const LoadingText = styled.p`
  margin: 0;
  color: #666;
  font-size: 16px;
`;

// Empty state
const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 16px;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyStateMessage = styled.p`
  margin: 0;
  color: #666;
  font-size: 16px;
  text-align: center;
`;
// Error state
const ErrorContainer = styled.div`
  width: 90%;
  max-width: 900px;
  margin: 20px auto;
  padding: 40px 20px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ErrorMessage = styled.p`
  margin: 0 0 24px;
  color: #d32f2f;
  font-size: 18px;
`;

const RetryButton = styled.button`
  background: #1976d2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #1565c0;
  }
`;

export default Leaderboard;