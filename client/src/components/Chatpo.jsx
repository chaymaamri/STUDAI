import React, { useState, useEffect, useRef } from "react";
import '../components/chatbot.css';
import { Box, IconButton, Typography, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions
 } from "@mui/material";
import botImage from '../components/bot.png'; // chemin vers bot.png
import userImage from '../components/user.png'; // chemin vers user.png
import axios from "axios";

function ChatWidget({ userName }) {
  const initialMessage = `عسلامة ${userName}، كيفاش تحس في روحك اليوم؟ 😊`;
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([initialMessage]);
  const [options, setOptions] = useState(['فرحان(ة)', 'تاعب(ة)', 'حزين(ة)']);
  const [step, setStep] = useState(0);
  const [inputMessage, setInputMessage] = useState(""); // état pour le champ input
  const chatEndRef = useRef(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false); // État pour la modal du badge
const [badgeEarned, setBadgeEarned] = useState(""); // État pour le nom du badge
const [badgeAlreadyShown, setBadgeAlreadyShown] = useState(false); // État pour vérifier si la modal a déjà été affichée


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  const recordChatInteraction = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    try {
      const response = await axios.post("http://localhost:5000/api/chatpo/interaction", {
        userId: storedUser.id,
      });
  
      console.log("API Response:", response.data);
  
      // Vérifiez si le message contient le texte du badge
      if (response.data.message.includes("earned the 'Always motivated' badge")) {
        console.log("Badge condition met! Showing modal...");
        setBadgeEarned("Always motivated");
        setShowBadgeModal(true);
      } else {
        console.log("Badge condition not met.");
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'interaction :", error);
    }
  };
  const handleResponse = (choice) => {
    // Ajoute le message de l'utilisateur
    setChatHistory((prevHistory) => [...prevHistory, choice]);

    let newMessage;
    if (step === 0) {
      if (choice === 'فرحان(ة)') {
        newMessage = 'الحمد لله! يا سلام 😊، اشرحلي أكثر شنو الحاجة اللي فرحتك اليوم؟';
        setOptions(['العائلة 👨‍👩‍👧‍👦', 'النجاح 🚀', 'الأصحاب 🤗', 'الحياة بصفة عامة ✨']);
      } else if (choice === 'تاعب(ة)') {
        newMessage = 'خذ راحتك شوية 💪، وإعرف إنك قوي قادر تتعدى التعب. شنو اللي منعبك اليوم؟';
        setOptions(['الخدمة 💼', 'الدراسة 📚', 'المسؤوليات 📝', 'ظروف أخرى 🙏']);
      } else if (choice === 'حزين(ة)') {
        newMessage = 'أنا هنا معاك ❤️، حتى في أصعب اللحظات. تنجم تحكيلي شنو اللي محزنك؟';
        setOptions(['الوحدة 🤍', 'الصعوبات اليومية 🙂', 'فقدان شيء مهم 🌟', 'ظروف أخرى 🙏']);
      }
      setStep(1);
    } else if (step === 1) {
      // Réponses pour "فرحان(ة)"
      if (choice.includes('العائلة')) {
        newMessage = 'العائلة مصدر الأمان والسعادة 👨‍👩‍👧‍👦!تفرح كي تشوفهم يضحكوا مع بعضهم؟';
        setOptions(['أكيد', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } else if (choice.includes('النجاح')) {
        newMessage = 'النجاح يحلي الحياة 🚀! ديما تذكر التعب اللي عملتو باش توصل. نعطيك نصائح للنجاح؟';
        setOptions(['نحب نصائح للنجاح', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } else if (choice.includes('الأصحاب')) {
        newMessage = 'الأصحاب هم الكنز الحقيقي 🤗! ديما خلي أصحابك المقرّبين بجنبك.';
        setOptions(['نعرف، الحمد لله', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } else if (choice.includes('الحياة بصفة عامة')) {
        newMessage = 'الحياة مليانة مفاجآت جميلة ✨! خلي أملك عالي وطموحاتك كبيرة.';
        setOptions(['أمل جديد كل يوم', 'إيه، عاود من الأول', 'عيشك شكرا']);
      }
      // Réponses pour "تاعب(ة)"
      else if (choice.includes('الخدمة')) {
        newMessage = 'حتى الخدمة تعلمنا دروس قيمة 💼. حاول توازن بين العمل والراحة.';
        setOptions(['كيف نلقى التوازن', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } else if (choice.includes('الدراسة')) {
        newMessage = 'الدراسة تتطلب جهد ومثابرة 📚. نصيحتي، خذ فترات راحة وراجع بانتظام.';
        setOptions(['نصائح للمراجعة', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } else if (choice.includes('المسؤوليات')) {
        newMessage = 'المسؤوليات برشا، لكن التنظيم هو المفتاح 📝. جرب تقسيم مهامك.';
        setOptions(['كيف ننظم وقتي', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } else if (choice.includes('ظروف أخرى')) {
        newMessage = 'بعض الأحيان، الحياة تختبرنا 🙏. ثق بإمكانياتك واستعن بالإيمان.';
        setOptions(['إن شاء الله', 'إيه، عاود من الأول', 'عيشك شكرا']);
      }
      // Réponses pour "حزين(ة)"
      else if (choice.includes('الوحدة')) {
        newMessage = 'الوحدة صعيبة، لكن فكّر في الناس اللي تحبك وتهتم بيك 🤍.';
        setOptions(['عندك الحق', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } else if (choice.includes('الصعوبات اليومية')) {
        newMessage = 'كل يوم فيه تحديات 🙂، لكن النجاح يكون في تجاوزها بابتسامة.';
        setOptions(['كيف نتعامل معهم', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } else if (choice.includes('فقدان شيء مهم')) {
        newMessage = 'أحياناً، الفقدان يترك أثر كبير 🌟. لكن الوقت يشفي الجروح ويعوضنا بما هو أجمل.';
        setOptions(['صحيح، لازم نصبر', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } else {
        newMessage = 'إن شاء الله الظروف تتحسن وتلقى راحة البال 🙏.';
        setOptions(['أمل خير', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } 
      setStep(2);
    } else if (step === 2) {
      // Réponses spécifiques
      if (choice === 'نحب نصائح للنجاح') {
        newMessage = 'باش تنجح، نظم وقتك، حدد أهداف واضحة، وتعلم من تجارب الآخرين 🏆. النجاح يستحق كل جهد!';
        setOptions(['عيشك شكرا']);
      } else if (choice === 'أمل جديد كل يوم') {
        newMessage = 'كل يوم فرصة جديدة لتحقيق أحلامك 🌞. ابتسم وواجه التحديات!';
        setOptions(['عيشك شكرا']);
      } else if (choice === 'كيف نلقى التوازن') {
        newMessage = 'التوازن بين العمل والحياة هو سر السعادة ⚖️. حاول تخصص وقت لنفسك ولعائلتك.';
        setOptions(['عيشك شكرا']);
      } else if (choice === 'نصائح للمراجعة') {
        newMessage = 'المراجعة بانتظام مع فترات استراحة تساعدك في تثبيت المعلومات 📝. جرب تقسيم الدراسة!';
        setOptions(['عيشك شكرا']);
      } else if (choice === 'كيف ننظم وقتي') {
        newMessage = 'استعمل أدوات تنظيم الوقت مثل  To-Do List في تطبيقنا  AITUDIANT ⏰. التنظيم يصنع الفرق!';
        setOptions(['عيشك شكرا']);
      } else if (choice === 'عندك الحق') {
        newMessage = 'كون محاط بأشخاص إيجابيين يرفع من معنوياتك 🤝. الأصدقاء الحقيقيون يسندونك دائماً.';
        setOptions(['عيشك شكرا']);
      } else if (choice === 'كيف نتعامل معهم') {
        newMessage = 'الصبر والثقة بالنفس هما الأساس 💪. خلي الأمل في قلبك وواجه التحديات!';
        setOptions(['عيشك شكرا']);
      } else if (choice === 'صحيح، لازم نصبر') {
        newMessage = 'الصبر مفتاح الفرج 🙏. ثق بأن الفرج قريب وابتسم رغم الصعاب.';
        setOptions(['عيشك شكرا']);
      } else if (choice === 'أمل خير') {
        newMessage = 'بإذن الله، الخير قادم 🌟. التفاؤل هو مفتاح النجاح!';
        setOptions(['عيشك شكرا']);
      } else if (choice === 'إيه، عاود من الأول') {
        newMessage = initialMessage;
        setOptions(['فرحان(ة)', 'تاعب(ة)', 'حزين(ة)']);
        setStep(0);
      } else if (choice === 'عيشك شكرا') {
        newMessage = 'على الرحب والسعة 😊! تذكر إنك دائماً مرحب بيك هنا.';
        setOptions(['إيه، عاود من الأول']);
      }
    }

    // Ajoute le nouveau message dans l'historique du chat
    setChatHistory((prevHistory) => [...prevHistory, newMessage]);
    recordChatInteraction();
  };

  return (
    <>
    <Dialog
  open={showBadgeModal}
  onClose={() => setShowBadgeModal(false)}
>
  <DialogTitle>🏅 Badge Earned🏅 </DialogTitle>
  <DialogContent>
    <p>🎉 Congratulations ! 🎉You earned the badge: {badgeEarned}🏅 </p>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setShowBadgeModal(false)}>Close</Button>
  </DialogActions>
</Dialog>
      {/* Bouton flottant avec l'image du bot */}
      <IconButton 
        onClick={toggleChat} 
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
          color: "#fff",
          "&:hover": { background: "linear-gradient(45deg, #1565c0 30%, #2196f3 90%)" },
          borderRadius: "50%",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        <img src={botImage} alt="Bot" style={{ width: 40, height: 40 }} />
      </IconButton>

      {/* Boîte de chat */}
      {isOpen && (
        <Box
        sx={{
          position: "fixed",
          bottom: 80,
          right: 16,
          width: { xs: '80%', sm: 300 },
          height: { xs: '60%', sm: 400 },
          background: "linear-gradient(135deg, #f9f9f9 30%, #e3f2fd 90%)", // Lighter blue color
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "fadeIn 0.5s",
          }}
          >
          {/* En-tête */}
          <Box
              sx={{
                padding: "10px 15px",
                background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                color: "#fff",
                borderRadius: "10px 10px 0 0",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img 
              src={botImage} 
              alt="Bot" 
              style={{ marginRight: 8, width: 40, height: 40, animation: "bounce 1s infinite" }} 
            />
            <Typography variant="h6">كيفاش تحس في روحك اليوم؟</Typography>
          </Box>

          {/* Historique du chat */}
          <Box
            sx={{
              flex: 1,
              padding: "10px",
              overflowY: "auto",
              borderBottom: "1px solid #ddd",
              backgroundColor: "#f9f9f9",
            }}
          >
            {chatHistory.map((message, index) => (
              <Box
                key={index}
                sx={{
                  marginBottom: 1,
                  textAlign: index % 2 === 0 ? "left" : "right",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {index % 2 === 0 
                  ? <img src={botImage} alt="Bot" style={{ marginRight: 8, width: 40, height: 40 }} />
                  : <img src={userImage} alt="User" style={{ marginRight: 8, width: 40, height: 40 }} />
                }
                <Typography
                  variant="body2"
                  className={index % 2 === 0 ? "agent-message" : "user-message"}
                  sx={{
                    display: "inline-block",
                    padding: "8px",
                    borderRadius: "10px",
                    backgroundColor: index % 2 === 0 ? "#f8d7da" : "#d1e7dd",
                    color: index % 2 === 0 ? "#842029" : "#0f5132",
                  }}
                >
                  {message}
                </Typography>
              </Box>
            ))}
            <div ref={chatEndRef} />
          </Box>

          {/* Options */}
          {options.length > 0 && (
            <Box sx={{ padding: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {options.map((option, index) => (
                <Button
                  key={index}
                  variant="contained"
                  color="primary"
                  onClick={() => handleResponse(option)}
                  sx={{
                    flex: "1 1 calc(50% - 10px)",
                    background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #1565c0 30%, #2196f3 90%)",
                    },
                  }}
                >
                  {option}
                </Button>
              ))}
            </Box>
          )}

          {/* Champ de saisie (si aucune option n'est présente) */}
          {options.length === 0 && (
            <Box sx={{ padding: "10px" }}>
              <TextField
                variant="outlined"
                placeholder="اكتب رسالتك هنا..."
                fullWidth
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                sx={{ marginBottom: 1 }}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #1565c0 30%, #2196f3 90%)",
                  },
                }}
              >
                إرسال
              </Button>
            </Box>
          )}
        </Box>
      )}
    </>
  );
}

export default ChatWidget;