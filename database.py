import sqlite3

def setup_and_populate():
    # الاتصال بقاعدة البيانات (سيتم إنشاؤها إن لم تكن موجودة)
    conn = sqlite3.connect('medlens.db')
    cursor = conn.cursor()

    # 1. إنشاء الجدول
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS medicines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        usage_instructions TEXT,
        warnings TEXT
    )
    ''')

    # 2. بيانات الأدوية
    medicines_list = [
        ('Panadol', 'مسكن للآلام وخافض للحرارة', 'حبة كل 6 ساعات عند اللزوم', 'يمنع لمرضى الكبد'),
        ('Amoclan', 'مضاد حيوي للالتهابات البكتيرية', 'حبة كل 12 ساعة بعد الأكل', 'يمنع لمن لديه حساسية بنسلين'),
        ('Advil', 'مسكن ومضاد للالتهابات', 'حبة بعد الأكل عند الحاجة', 'يمنع لمرضى قرحة المعدة')
    ]

    # 3. إدخال البيانات
    for med in medicines_list:
        cursor.execute("SELECT name FROM medicines WHERE name = ?", (med[0],))
        if not cursor.fetchone():
            cursor.execute('''
                INSERT INTO medicines (name, description, usage_instructions, warnings) 
                VALUES (?, ?, ?, ?)
            ''', med)

    conn.commit()
    conn.close()
    print("تم تجهيز قاعدة البيانات بنجاح!")

if __name__ == "__main__":
    setup_and_populate()