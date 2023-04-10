//необходимо для проверки наличия ошибок при запросе
import { validationResult } from 'express-validator'

//middleware на распарсивание ошибок при валидации данных
export default (req, res, next) => {
	//вытаскиваем все входные данные из запроса и проверяем с помощью validationResult и если ошибки есть парсим и  помещаем их в errors(и возвращаем)
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json(errors.array())
	}
	next()
}
