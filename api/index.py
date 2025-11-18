from flask import Flask, request, jsonify
import random

# Inisialisasi aplikasi Flask
app = Flask(__name__)

# Buat satu rute (endpoint) di /api/problem
# Vercel akan otomatis menangani ini dari nama file
@app.route('/api/problem', methods=['GET'])
def get_problem():
    # Ambil mode operasi (?op=) dari URL
    operation = request.args.get('op', '+')

    problem_text = ""
    correct_answer = 0

    if operation == '-': # Pengurangan
        num1 = random.randint(1, 10)
        num2 = random.randint(1, 10)
        if num1 < num2:
            num1, num2 = num2, num1 # Tukar angka
        correct_answer = num1 - num2
        problem_text = f"{num1} - {num2} ="
        
    elif operation == '*': # Perkalian
        num1 = random.randint(1, 10)
        num2 = random.randint(1, 10)
        correct_answer = num1 * num2
        problem_text = f"{num1} × {num2} ="
        
    elif operation == '/': # Pembagian
        result = random.randint(2, 10)
        num2 = random.randint(2, 10)
        num1 = result * num2
        correct_answer = result
        problem_text = f"{num1} ÷ {num2} ="
        
    else: # Penjumlahan (default)
        num1 = random.randint(1, 10)
        num2 = random.randint(1, 10)
        correct_answer = num1 + num2
        problem_text = f"{num1} + {num2} ="

    # Kembalikan soal dan jawaban dalam format JSON
    return jsonify({
        'question': problem_text,
        'answer': correct_answer
    })

# Baris ini diperlukan jika Anda ingin menguji di komputer lokal
# Vercel akan mengabaikan ini saat deploy
if __name__ == '__main__':
    app.run(debug=True)
