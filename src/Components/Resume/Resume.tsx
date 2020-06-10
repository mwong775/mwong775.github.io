import React from 'react';
import CV from '../../assets/cv/Melanie_Wong_Resume.pdf';
import Button from '@material-ui/core/Button';
import styles from './Resume.scss';

const CVUrl = `${CV}?#zoom=FitH&scrollbar=0&toolbar=0&navpanes=0`;

export class Resume extends React.Component {

  render() {
    return (
      <div className="content-wrapper">
        <h2 className="gradient-font">Resume</h2>
        <br/>
        <Button href="https://github.com/mwong775/melaniewong.github.io/raw/development/Resume.pdf" download={'Melanie Wong Resume'}>Download</Button>
        <div className="resume-container">
            <object className={styles.pdf} type="application/pdf" data={CVUrl}>
              <p>PDF cannot be displayed :(</p>
            </object>
        </div>
      </div>
    );
  }
}