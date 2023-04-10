//чтобы node.js понимал импорты в package.json прописываем type:module
//чтобы при изменениях в этом файле не перезапускать сервер каждый раз...прописываем в package.json "start:dev": "nodemon index.js"(start:dev название произвольное)
//И запускаем сервак(npm run start:dev) уже с отстлеживанием изменением файла index.js
//команда для запуска файла index.js ("start": "node index.js") npm run start

//импортируем express...до from название произвольное
import express from 'express'

//после установки MongoDB подключаем mongoose
import mongoose from 'mongoose'

//загрузчик картинок
import multer from 'multer'

//импортируем cors для того чтобы можно было из front ходить на back(делать запросы)
import cors from 'cors'

//если мы используем импорты как модули (в package.json прописываем type:module) то указание расширения обязательно
import {
	registValidation,
	loginValidation,
	postCreateValidation,
} from './validations.js'

//импортируем middleware для аутентификации пользака и парсинга ошибок ввода данных в запросы
import { validationErrorsRequest, checkAuth } from './utils/index.js'

//импортируем контроллеры из точки вхлда контроллеров (index.js)
import { PostController, UserController } from './controllers/index.js'

//Настраиваем connect для подключения в DB и указываем внутри логин и пароль (zvetochny:wwwwww) и название базы данных в MongoDB Cpmpass(my-blog) для общения с MongoDB
//когда сделали подключение проверяем,подключены ли мы .then(() => console.log('DB OK!...'))
mongoose
	.connect(
		'mongodb+srv://zvetochny:wwwwww@cluster0.j12cow1.mongodb.net/my-blog?retryWrites=true&w=majority'
	)

	.then(() => console.log('DB OK!...'))
	.catch(err => console.log('DB Error', err))

//создаём express приложение
//вся логика express храниться в app
const app = express()

//создаём хранилище для картинок
const storage = multer.diskStorage({
	//указываем специальный путь куда будем сохранять наши картинки
	//когда будет создаваться хранилище будет вызываться функция destination
	destination: (_, __, cb) => {
		//она не получает никаких ошибок(первый параметр) и сохраняет все картинки в папку upLoads
		cb(null, 'upLoads')
	},
	//теперь описываем как будут называться файлы
	//берём файл кот.будет загружаться
	filename: (_, file, cb) => {
		//возьмём файл и достанем из него его оригинальное название и с таким названием сохраним наш файл
		cb(null, file.originalname)
	},
})

//теперь эту логику загрузки картинок объясняем express
//создаём функцию(middleware) кот. нам позволит использовать хранилище
const upload = multer({ storage })

//наше приложение не знает как работать с данными json.Учим его это делать.Теперь будет уметь читать json
//Если этого не сделать то в теле запроса req.body будет храниться undefined
app.use(express.json())

//подключаем cors к проекту,чтобы backend разрешал делать к нему запросы откуда угодгно...а именно с front(http://localhost:3000)
app.use(cors())

//объясняем express что если придёт запрос на /upload...то следи за папкой uploads, и за её содержимым.Делаем это с помощью express.static(эта штука будет понимать, что ты не просто делаешь get запрос,а делашь get запрос на получение статичного файла)
app.use('/upload', express.static('uploads'))

//создаём роут
//если на главный путь "/"(http://localhost:4444/) придёт get запрос,то я выполняю опред.логику
//в req храниться то что прислал front(то что пришло с клиента)
//в res я объясняю что я буду передавать клиенту в ответ
app.get('/', (req, res) => {
	res.send(`Hello friend ${Date()}`)
})

//__________Запросы для User
//отлавливаем post запрос по адресу "/auth/login" название адреса произвольное
// app.post('/auth/login', (req, res) => {
// 	console.log(req.body)
// 	//создаём токен и внутрь передаём ту информацию кот.будем шифровать  и шифруем её с помощью secret123(название произвольное и может быть любым)И возвращаем этот token в ответ клиенту
// 	const token = jwt.sign(
// 		{
// 			email: req.body.email,
// 			fullName: ' Вася Пупкин',
// 		},
// 		'secret123'
// 	)
// 	//после получения запроса post на указанный адрес возвращаем json...success: true(можно написать всё что угодно)
// 	res.json({
// 		success: true,
// 		token,
// 	})
// })
//теперь нужно запустить приложение.Указываем порт на котором будем запускатьЧтоб запустить файл пишем в терминале node index.js(и если web server запустился, то увидим сообщение Server OK!...)

//++++++++++++++++++++++++++++//
//при отправке запроса на регистрацию и создание User мы сначала проверяем все ли данные пришли кот.мы ждём(registValidation), и если да, то уже потом приступаем к обработке запроса
app.post(
	'/auth/register',
	registValidation,
	validationErrorsRequest,
	UserController.registr
)

//++++++++++++++++++++++++//
//Делаем запрос на авторизацию
app.post(
	'/auth/login',
	loginValidation,
	validationErrorsRequest,
	UserController.login
)

//+++++++++++++++++//
//запрос на получение инфы о себе  и передаём вторы параметром(после url) middleware(проверка прав), если всё ок и middleware скажет что права есть,тогда переходим к async fn
app.get('/auth/me', checkAuth, UserController.getMe)

//__________запрос на загрузку картинок
//создаём запрос и роут(upload)
//когда придёт запрос на uload(роут),мы перед тем как запустить функ-ю обработчик...запустил middleware(upload)из multer и будем ждать что придёт свойство image с какой то картинкой
app.post('/upload', checkAuth, upload.single('image'), async (req, res) => {
	//если проверка в middleware upload прошла успешно вернём на клиент ответ с адресом до картинки
	res.json({
		url: `/upload/${req.file.originalname}`,
	})
})

//__________Запросы для Post
//когда используем CRUD RestApi в url не долны попадать название методов запроса(create,delete,update...)
//А нужно всегда указывать один путь(роут) и это /posts и у этого пути есть разные методы(getAll,getOne,create,delete...)
app.get('/tags', PostController.getLastTags)
//получение всех статей(а не опред.автора...то нет смысла в проверке авторизации)
app.get('/posts', PostController.getAll)

//получение одной статьи.Есть какой то динамический параметр(id...называться он может как угодно)
app.get('/posts/:id', PostController.getOne)
//создание статьи...уже метод не get, а post.При создании потребуется token...т.к. только авторизованный пользак может создавать статьи.Сначала проверяется авторизация(checkAuth),потом валидация(postCreateValidation) и уже потом функция обработчик(PostController.createPost)
app.post(
	'/posts',
	checkAuth,
	postCreateValidation,
	validationErrorsRequest,
	PostController.createPost
)
//удаление статьи.Указываем id статьи кот.нужно удалить
app.delete('/posts/:id', checkAuth, PostController.removePost)
//обновление статьи.Указываем id статьи кот.нужно изменить
app.patch(
	'/posts/:id',
	checkAuth,
	postCreateValidation,
	validationErrorsRequest,
	PostController.updatePost
)
console.log('Hello')
//+++++++++++++++++++//
app.listen(4444, err => {
	if (err) {
		return console.log(err)
	}
	console.log('Server OK!...')
})
