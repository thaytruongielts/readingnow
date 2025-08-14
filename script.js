// Thay thế 'YOUR_API_KEY' bằng API key của bạn
const API_KEY = 'AIzaSyBQF_QNBE4MVghEHLhHtfuzxWAPB5zRvLU'; 
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

// Lấy các phần tử DOM
const passageContainer = document.getElementById('passage-container');
const nextButton = document.getElementById('next-button');
const questionTextElement = document.getElementById('question-text');
const userAnswerTextarea = document.getElementById('user-answer');
const submitButton = document.getElementById('submit-button');
const feedbackSection = document.getElementById('feedback-section');
const correctSentencesElement = document.getElementById('correct-sentences');

// Biến để lưu trữ dữ liệu bài tập hiện tại
let currentExercise = null;

// Hàm gọi API để tạo bài tập IELTS
async function generateIELTSExercise() {
    // Hiển thị thông báo lỗi nếu có lỗi API
    const errorDisplay = document.querySelector('.container .error-message');
    if (errorDisplay) errorDisplay.remove();

    try {
        const prompt = `
            Hãy tạo một bài đọc IELTS, một câu hỏi thuộc một trong các dạng sau: heading matching, multiple choice, true/false/not given, hoặc gap filling, và một câu hỏi phụ yêu cầu tìm 1-2 câu trong bài đọc chứa đáp án của câu hỏi chính.
            
            Dữ liệu trả về phải là một đối tượng JSON với cấu trúc sau:
            {
              "passage": "Nội dung bài đọc ở định dạng HTML (ví dụ: <p>...</p>).",
              "question": "Nội dung câu hỏi chính (ví dụ: 'Which of the following...').",
              "type": "Dạng câu hỏi (ví dụ: 'multiple choice').",
              "correctAnswer": "Đáp án đúng cho câu hỏi chính (ví dụ: 'A', 'True', hoặc 'câu trả lời điền vào chỗ trống').",
              "sourceSentences": "1-2 câu trích từ bài đọc chứa đáp án cho câu hỏi chính."
            }
            
            Đảm bảo bài đọc đủ dài và câu hỏi có tính học thuật, phù hợp với trình độ IELTS.
        `;

        const response = await fetch(`${API_ENDPOINT}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        const data = await response.json();
        
        // Trích xuất nội dung từ phản hồi của API
        const content = data.candidates[0].content.parts[0].text;
        
        // API có thể trả về code block markdown, cần parse nó
        const jsonString = content.replace(/```json\n|\n```/g, '');
        const exerciseData = JSON.parse(jsonString);
        
        return exerciseData;

    } catch (error) {
        console.error('Lỗi khi tạo bài đọc:', error);
        
        // Thêm một thông báo lỗi vào DOM
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = 'Đã xảy ra lỗi khi tạo bài đọc: API response error:';
        errorMessage.style.color = 'red';
        errorMessage.style.marginBottom = '20px';
        passageContainer.parentElement.insertBefore(errorMessage, passageContainer);

        return null;
    }
}

// Hàm render bài tập lên giao diện
function renderExercise(exercise) {
    if (!exercise) {
        passageContainer.innerHTML = '';
        questionTextElement.textContent = '';
        return;
    }
    
    passageContainer.innerHTML = `<h2>Reading Passage</h2>` + exercise.passage;
    questionTextElement.textContent = exercise.question;
    userAnswerTextarea.value = '';
    feedbackSection.style.display = 'none';
}

// Hàm xử lý sự kiện khi ấn nút "Bài Mới"
nextButton.addEventListener('click', async () => {
    nextButton.disabled = true;
    passageContainer.innerHTML = 'Đang tạo bài tập...';
    
    currentExercise = await generateIELTSExercise();
    renderExercise(currentExercise);
    
    nextButton.disabled = false;
});

// Hàm xử lý sự kiện khi ấn nút "Nộp"
submitButton.addEventListener('click', () => {
    if (!currentExercise) return;
    
    const submittedAnswer = userAnswerTextarea.value.trim();
    
    // So sánh đáp án của học viên với đáp án đúng
    // Ở đây, chúng ta chỉ hiển thị đáp án đúng, không chấm điểm
    feedbackSection.style.display = 'block';
    correctSentencesElement.textContent = currentExercise.sourceSentences;
});

// Khởi chạy lần đầu khi trang load
nextButton.click();