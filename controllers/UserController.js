//Данный файл нужен для того чтобы основной файд index.js стал чище...читабельнее.
//Сюда мы перемещаем все async функции кот. используються в запросе в виде cb (async (req, res) => {})

//импортируем jsonwebtoken...до from название произвольное
import jwt from 'jsonwebtoken'

//импортируем bcrypt для шифрования пароля
import bcrypt from 'bcrypt'

//импортируем модель User для создания Пользователя(User)
import UserModel from '../models/User.js'

export const registr = async (req, res) => {
	try {
		//достаём пароль для шифрования
		const password = req.body.password

		//задаём алгоритм шифрования(генерируем)
		const salt = await bcrypt.genSalt(10)

		//генерируем новый(зашифрованный) пароль
		const hash = await bcrypt.hash(password, salt)

		//хотим подготовить документ на создание пользака
		const doc = new UserModel({
			email: req.body.email,
			passwordHash: hash,
			fullName: req.body.fullName,
			avatarUrl: req.body.avatarUrl,
		})

		//создаём пользака
		const user = await doc.save()

		//шифруем информацию после создания пользака в DB и возвращаем токен
		const token = jwt.sign(
			{
				//шифруемся только по _id(он так заносится в DB).Нам этой инфы будет достаточно для того чтобы работать дальше
				_id: user._id,
			},
			'secret123',
			{
				//срок действия токена(потом будет не валидный)
				expiresIn: '30d',
			}
		)

		//уберём из ответа passwordHash,а всё остальное возвращаем как развёрнутую переменную userData
		const { passwordHash, ...userData } = user._doc

		//возвращаем инфу о пользаке( только из _doc,не нужна лишняя инфа) и token.Ответ должен быть только один!!!
		// res.json({ ...userData, token })
		res.json({ ...userData, token })
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Не удалось зарегистрироваться',
		})
	}
}
export const login = async (req, res) => {
	try {
		const user = await UserModel.findOne({
			email: req.body.email,
		})
		if (!user) {
			return res.status(404).json({
				message: 'Неверный логин или пароль М',
			})
		}

		const isValidPass = await bcrypt.compare(
			req.body.password,
			user._doc.passwordHash
		)
		if (!isValidPass) {
			return res.status(400).json({
				message: 'Неверный логин или пароль П',
			})
		}

		//шифруем информацию после создания пользака в DB и возвращаем токен
		const token = jwt.sign(
			{
				//шифруемся только по _id(он так заносится в DB).Нам этой инфы будет достаточно для того чтобы работать дальше
				_id: user._id,
			},
			'secret123',
			{
				//срок действия токена(потом будет не валидный)
				expiresIn: '30d',
			}
		)

		//уберём из ответа passwordHash,а всё остальное возвращаем как развёрнутую переменную userData
		const { passwordHash, ...userData } = user._doc

		//возвращаем инфу о пользаке( только из _doc,не нужна лишняя инфа) и token.Ответ должен быть только один!!!
		// res.json({ ...userData, token })
		res.json({ ...userData, token })
	} catch (err) {
		console.log(err)
		return res.status(500).json({ message: 'Не удалось авторизоваться' })
	}
}
export const getMe = async (req, res) => {
	//после того как в middleware checkAuth сработал next(),то переходим к блоку try
	try {
		//находим пользователя по данным из req.userId(там лежит расшифрованный(в middleware checkAuth) token)
		//Обязательно ждём (await)!!!(а то данные не успеют прийти и пользак не найдётся)
		const user = await UserModel.findById(req.userId)

		//если такого пользака нет,то скажи нам об этом
		if (!user) {
			res.status(403).json({
				message: 'Пользователь не найден',
			})
		}

		//если пользак нашёлся то...
		//убераем из ответа passwordHash,а всё остальное возвращаем как развёрнутую переменную userData
		const { passwordHash, ...userData } = user._doc

		//возвращаем инфу о пользаке( только из _doc,не нужна лишняя инфа) .Ответ должен быть только один!!!
		// res.json(userData )
		res.json(userData)
	} catch (err) {
		res.status(500).json({
			message: 'Нет доступа me',
		})
	}
}
