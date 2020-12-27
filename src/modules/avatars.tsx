import registerModule from '~/core/module';

import { getUserId } from '~/utils/user';
import { waitForLoad, waitForOne, createElement } from '~/utils/dom';
import { getImgurImage, changeImage, resetImage } from '~/utils/imgur';

const domQuery = {
  avatarContainers: () => [
    document.querySelector('.directory-results-container') as HTMLElement, // directory
    document.querySelector('#RosterCardContainer') as HTMLElement, // class rosters
    document.querySelector('#communitiesContainer') as HTMLElement, // community container
    document.querySelector('#activity-stream') as HTMLElement, // news
    document.querySelector('#athleticteammaincontainer') as HTMLElement, // athletics roster
    document.querySelector('#contact-col-left > div > section') as HTMLElement, // profile image
  ],

  header: () => document.querySelector('.bb-avatar-image-nav') as HTMLImageElement,
};

// // insert into class="row" at top
// async function createRosterImage(studentId: string): Promise<HTMLDivElement> {
//   const imgurImage = await getImgurImage(studentId);
//   if (imgurImage) {
//     return (
//       <div className="col-md-4" style={{ verticalAlign: 'top', paddingTop: '35px' }}>
//         <div className="bb-avatar-wrapper">
//           <img alt="Profile Picture" src={imgurImage.link} className="bb-avatar-image" />
//         </div>
//       </div>
//     ) as HTMLDivElement;
//   }
//   return null;
// }

// // insert into td at top
// async function createDirImage(studentId: string): Promise<HTMLDivElement> {
//   const imgurImage = await getImgurImage(studentId);
//   if (imgurImage) {
//     return (
//       <div className="bb-avatar-wrapper">
//         <img src={imgurImage.link} className="bb-avatar-image" />
//       </div>
//     ) as HTMLDivElement;
//   }
//   return null;
// }

let buttons = (
  <span style={{display: "inline-block", marginTop: "10px"}}>
    <input id="input" type="file" accept="image/*" style={{ display: 'none' }}/>
    <button className="btn btn-default" style={{ marginLeft: "15px", borderTopRightRadius: "0px", borderBottomRightRadius: "0px" }}>
      <label htmlFor="input" style={{ marginBottom: '0px', fontWeight: 'normal' }}>Choose Avatar</label>
    </button>
    <button className="btn btn-default" id="save" style={{borderTopLeftRadius: "0px", borderBottomLeftRadius: "0px"}}>Save</button>
    <button className="btn btn-default" id="reset" style={{marginLeft: "5px"}}>Reset</button>
  </span>
);

let file = () => buttons.querySelector('input').files[0];
const save = buttons.querySelector('#save') as HTMLButtonElement;
const reset = buttons.querySelector('#reset') as HTMLButtonElement;

save.onclick = async function () {
  await changeImage(file());
  window.location.reload();
};

reset.onclick = async function () {
  await resetImage();
  window.location.reload();
};

async function replace(container: HTMLElement): Promise<void> {
  const images: NodeListOf<HTMLImageElement> = container.querySelectorAll('.bb-avatar-image');
  for (const image of images) {
    const [studentId] = /(?<=user)\d+/.exec(image.src) || [null]; // Find the student id from the url, otherwise null. null is in an array since studentId should be the first element of the exec array
    let newImage = await getImgurImage(studentId);
    image.src = newImage?.link || image.src; // Sets src to imgur image if it can find it for the current students id, otherwise leaves it alone
  }
}

const obs = new MutationObserver(async mutationList => {

  for (let mutation of mutationList) { // For each mutation
    for (let newNode of mutation.addedNodes) { // For each new node
      if (newNode instanceof HTMLElement) {
        replace(newNode);
      }
    }
  }

});

async function avatarInit() {
  const img: HTMLImageElement = await waitForLoad(domQuery.header);
  const imgurImage = await getImgurImage(await getUserId());
  img.src = imgurImage?.link || img.src;
  const obs = new MutationObserver(() => img.src = imgurImage?.link || img.src);
  obs.observe(img, { attributes: true });
}

async function avatarMain() {
  const [container]: HTMLElement[] = await waitForOne(domQuery.avatarContainers, true);
  replace(container);
  const options: MutationObserverInit = { subtree: true, childList: true };
  obs.observe(container, options); // only on directory?
  if (location.href.endsWith('contactcard')) {
    (await waitForLoad(() => document.querySelector('#contact-col-left > div > section > div > div.bb-tile-content > div > div') as HTMLElement)).appendChild(buttons); // makes website SUPER slow, need to fix before release.
    // Putting dom here made the page load better but every time you sign into the website for the first time the entire thing crashes.
  }
}

export default registerModule('{df198a10-fcff-4e1b-8c8d-daf9630b4c99}', {
  name: 'Avatars (Beta)',
  description: `Allows user to change their profile picture and view other students' changed pictures. 
  To change your picture, navigate to your profile page, click "Change Avatar" and then "Save."`,
  defaultEnabled: true,
  main: avatarMain,
  init: avatarInit,
});
