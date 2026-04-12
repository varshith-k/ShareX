import React from 'react';

function Dashboard() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.heading}>My Files</h2>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '32px 16px',
  },
  container: {
    margin: '0 auto',
    maxWidth: '1000px',
  },
  heading: {
    marginBottom: '24px',
  },
};

export default Dashboard;