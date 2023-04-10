import { body } from 'express-validator'

//валидация для регистрации
export const registValidation = [
	// если в нашем теле запроса есть email и он является email и он корректный
	//password мин. 5 символов
	//fullName мин,3 символа
	//avatarUrl это опциональное своёство и если оно не придёт то ничего страшного...а если придёт,то проверяем...является ли это св-во ссылкой
	body('email', 'Неверный формат почты').isEmail(),
	body('password', 'Пароль должен быть минимум 5 символов').isLength({
		min: 5,
	}),
	body('fullName', 'Слишком короткое имя').isLength({
		min: 3,
	}),
	body('avatarUrl', 'Неверная ссылка на аватарку').optional().isURL(),
]

//валидация для авторизации
export const loginValidation = [
	// если в нашем теле запроса есть email и он является email и он корректный
	//password мин. 5 символов

	body('email', 'Неверный формат почты').isEmail(),
	body('password', 'Пароль должен быть минимум 5 символов').isLength({
		min: 5,
	}),
]

//валидация для создании статьи
export const postCreateValidation = [
	body('title', 'Введите заголовок статьи').isLength({ min: 3 }).isString(),
	body('text', 'Введите текст статьи').isLength({ min: 10 }).isString(),
	body('tags', 'Неверный формат тегов').optional().isString(),
	body('imageUrl', 'Неверная ссылка на изображение').optional().isString(),
]
