import Router from "express";
import botController from "../../Controllers/botController";
const router = Router();

router.route('/links').get(botController.getLinks);

router.route('/play').post(botController.playYoutube);

router.route('/pause').get(botController.pauseYoutube);

router.route('/delete').post(botController.deleteYoutube);

router.route('/resume').get(botController.resumeYoutube);

router.route('/addlink').post(botController.addYoutubeLink);

router.route('/next').get(botController.playNextYoutube);

router.route('/prev').get(botController.playPrevYoutube);

router.route('/volumedown').get(botController.volumeDown);

router.route('/volumeup').get(botController.volumeUp);

router.route("/stop").get(botController.stopYoutube);

router.route("/shuffle").get(botController.shuffleYoutube);

router.route('/order').post(botController.updateOrder);

export default router;