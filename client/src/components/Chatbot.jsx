import React, { useState, useRef, useEffect } from 'react';
import '../components/chatbot.css';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import Avatar from '@mui/material/Avatar';
const Chatbot = ({ userName,userImage }) => {
  const initialMessage = `عسلامة ${userName}، كيفاش تحس في روحك اليوم؟`;
  const [chatHistory, setChatHistory] = useState([initialMessage]);
  const [options, setOptions] = useState(['فرحان(ة)', 'تاعب(ة)', 'حزين(ة)']);
  const [step, setStep] = useState(0);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleResponse = (choice) => {
    let newMessage;
    if (step === 0) {
      if (choice === 'فرحان(ة)') {
        newMessage = 'الحمد لله! شنوة الحاجة اللي مفرحتك اليوم؟';
        setOptions(['العائلة', 'النجاح', 'الأصحاب', 'الحياة بصفة عامة']);
      } else if (choice === 'تاعب(ة)') {
        newMessage = 'خذ راحتك شوية، ديما راك قادر تتعدى التعب! شنو سبب التعب؟';
        setOptions(['الخدمة', 'الدراسة', 'المسؤوليات', 'ظروف أخرى']);
      } else if (choice === 'حزين(ة)') {
        newMessage = 'الحياة صعيبة أما ديما نلقاو الأمل! شنوة السبب اللي حزنك؟';
        setOptions(['الوحدة', 'الصعوبات اليومية', 'فقدان شيء مهم', 'ظروف أخرى']);
      }
      setStep(1);
    } else if (step === 1) {
      // Réponses pour "فرحان(ة)"
      if (choice === 'العائلة') {
        newMessage = 'العايلة ديما مصدر الفرح والقوة! تفرح كيف تشوف عايلتك مبسوطين؟';
        setOptions(['أكيد', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } else if (choice === 'النجاح') {
        newMessage = 'النجاح فرحة كبيرة، ديما تذكر التعب اللي عملته باش توصل! عندك نصائح للنجاح؟';
        setOptions(['نحب نصائح للنجاح', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } else if (choice === 'الأصحاب') {
        newMessage = 'الأصحاب برشا سعادة! ديما خلي أصحابك المقرّبين ديما جنبك.';
        setOptions(['نعرف، الحمد لله', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } else if (choice === 'الحياة بصفة عامة') {
        newMessage = 'الحياة جميلة، وديما مليانة حاجات حلوة. خلي أملك ديما عالي!';
        setOptions(['أمل جديد كل يوم', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } 
      // Réponses pour "تاعب(ة)"
      else if (choice === 'الخدمة') {
        newMessage = 'الخدمة صعيبة، أما تتعلم منها برشا حاجات. ديما حاول توازن حياتك.';
        setOptions(['كيف نلقى التوازن', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } else if (choice === 'الدراسة') {
        newMessage = 'الدراسة تعب، أما المستقبل يستاهل المجهود. عندك نصائح للمراجعة؟';
        setOptions(['نصائح للمراجعة', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } else if (choice === 'المسؤوليات') {
        newMessage = 'المسؤوليات برشا، أما تنظيم الوقت يعاونك برشا!';
        setOptions(['كيف ننظم وقتي', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } else if (choice === 'ظروف أخرى') {
        newMessage = 'ديما ظروف الحياة فيها تحديات، لكن الإيمان والرضا يعاونوا برشا.';
        setOptions(['إن شاء الله', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } 
      // Réponses pour "حزين(ة)"
      else if (choice === 'الوحدة') {
        newMessage = 'الوحدة صعيبة، أما فكر في الناس اللي تحبك وتهتم بيك!';
        setOptions(['عندك الحق', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } else if (choice === 'الصعوبات اليومية') {
        newMessage = 'الصعوبات اليومية تحدي، أما ديما نحاولوا نشوفوا الجانب الإيجابي.';
        setOptions(['كيف نتعامل معهم', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } else if (choice === 'فقدان شيء مهم') {
        newMessage = 'الفقدان يوجع، أما ديما نلقاو حاجات جديدة تعوضنا.';
        setOptions(['صح، لازم نصبر', 'إيه، عاود من الأول', 'عيشك شكرا']);
      } else {
        newMessage = 'إن شاء الله الظروف تتحسن وتلقى راحة البال.';
        setOptions(['أمل خير', 'إيه، عاود من الأول', 'عيشك شكرا']);
      }
      setStep(2);
    } else if (step === 2) {
      // Ajouter des réponses spécifiques
      if (choice === 'نحب نصائح للنجاح') {
        newMessage = 'باش تنجح، نظم وقتك، حدد أهداف واضحة، وديما تعلم من تجاربك. تتمنى حاجة أخرى؟';
        setOptions(['عيشك شكرا']);
      } else if (choice === 'أمل جديد كل يوم') {
        newMessage = 'كل يوم يجي بأمل جديد، خليك ديما متفائل وتحدى الصعاب.';
        setOptions(['عيشك شكرا']);
      } else if (choice === 'كيف نلقى التوازن') {
        newMessage = 'التوازن يتطلب تنظيم الوقت وتخصيص وقت للراحة. المهم تلتزم بخطة واضحة.';
        setOptions(['عيشك شكرا']);
      } else if (choice === 'نصائح للمراجعة') {
        newMessage = 'خذ وقت للراحة بين المراجعات، خطط مسبقاً، وذاكر في بيئة هادئة. تواصل نعاونك؟';
        setOptions(['عيشك شكرا']);
      } else if (choice === 'كيف ننظم وقتي') {
        newMessage = 'التنظيم يبدأ بتحديد أولوياتك واستعمال أدوات للتنظيم كيف To-Do List وGoogle Calendar.';
        setOptions(['عيشك شكرا']);
      } else if (choice === 'عندك الحق') {
        newMessage = 'مهم تلقى الناس اللي تفهمك وتعاونك. العزلة تزيد الحزن، تقرب من الناس اللي تحبك.';
        setOptions(['عيشك شكرا']);
      } else if (choice === 'كيف نتعامل معهم') {
        newMessage = 'نتعامل معهم بالصبر والثقة في روحك. الأمل هو اللي يعطيك القوة للتحدي.';
        setOptions(['عيشك شكرا']);
      } else if (choice === 'صح، لازم نصبر') {
        newMessage = 'الصبر مفتاح الراحة. ديما تلقى نور بعد كل لحظة صعيبة.';
        setOptions(['عيشك شكرا']);
      } else if (choice === 'أمل خير') {
        newMessage = 'إن شاء الله كل حاجة خير قدامك، ديما تفاءل بالخير تلقاه.';
        setOptions(['عيشك شكرا']);
      } else if (choice === 'إيه، عاود من الأول') {
        newMessage = initialMessage;
        setOptions(['فرحان(ة)', 'تاعب(ة)', 'حزين(ة)']);
        setStep(0);
      } else if (choice === 'عيشك شكرا') {
        newMessage = 'مرحبًا بك في أي وقت، نتمنى لك يوم مليء بالسعادة والراحة!';
        setOptions(['إيه، عاود من الأول']);
      }
    }

    setChatHistory((prevHistory) => [...prevHistory, choice, newMessage]);
  };

  return (
    <section>
    <div className="chatbot-container">
    <div className="chatbot-history">
      {chatHistory.map((msg, index) => (
        <div key={index} className="chat-message">
          {index % 2 === 0 ? (
            <div className="user-message">
              <Avatar src={userImage} alt={userName}>
                {/* {!userImage && userName.charAt(0)} */}
              </Avatar>
              <p>{msg}</p>
            </div>
          ) : (
            <div className="bot-message">
              <ChatBubbleOutlineIcon />
              <p>{msg}</p>
            </div>
          )}
        </div>
      ))}
      <div ref={chatEndRef} />
    </div>
    <div className="chatbot-options">
      {options.map((option) => (
        <button key={option} onClick={() => handleResponse(option)} className="chatbot-button">
          {option}
        </button>
      ))}
    </div>
  </div>
  </section>
);
};

export default Chatbot;
