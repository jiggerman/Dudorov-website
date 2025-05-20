# dict
# key : value
# key - уникальный
'''

users = dict()
obj = {"id": 120312, "name": "Vlad", "email": "lasi@mail.ru"}  # множество

print(obj)
print(*obj)

for key in obj:
    print(key, obj[key])

print("-----------------------")
# Получение значений
# [] - если уверен, что ключ существует
# .get() - есть нужна проверка на наличие ключа

print(obj['id'])
#  print(obj['1']) Ошибка ключа
print(obj.get('id'))
print(obj.get('1'))  # Если ключа нет, то программа не падает, а выдает None

# Изменение поля
obj['id'] = 123123
print(obj['id'])

# Создание новых пар key : value
# dict_name[key_name] = value

obj['password'] = 1203910293
print(obj)

print("--------------------------")
# Получение ключей, значений и пар
print(list(obj.keys()))
print(list(obj.values()))
print(list(obj.items()))

# 5 4 3 2 1
# 5 Отлично
marks = {
    1: "Кол",
    2: "Два",
    3: "Три",
    4: "Хорошо",
    5: "Супер!"
}

mark = int(input())
print(marks[mark])

# copy

users = []
base_user = {
    "Name": None,
    "Age": None,
    "Email": None
}

for i in range(4):
    if i % 2 == 0:
        now_user = base_user.copy()
        now_user['name'] = "ЧЕТКИЙ"
        users.append(base_user.copy())
    else:
        users.append(base_user.copy())

print(users)
'''
d1 = {1: 1}
d2 = {2: 2}
d1.update(d2)
print(d1)